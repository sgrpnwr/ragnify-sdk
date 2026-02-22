import * as DocumentPicker from "expo-document-picker";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSapientAuth } from "../context/AuthContext";
import { generateNonce, handleErrors } from "../utils/general";
import { uploadPdfWeb } from "../utils/webUpload";

type Tab = "upload" | "tenants" | "users";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isAdmin: boolean;
  tenant: {
    tenantId: string;
    clientSecret?: string;
  };
  createdAt: string;
}

interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  hmacSecret: string;
  createdAt: string;
}

type Props = {
  onLogout?: () => void;
  onNavigateBack?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToError?: () => void;
};

export default function AdminDashboard({
  onLogout,
  onNavigateBack,
  onNavigateToHome,
  onNavigateToError,
}: Props) {
  const { user, accessToken, logout, config } = useSapientAuth();
  const baseUrl = config?.baseUrl || "http://localhost:8000";

  // Check if user is super admin
  const isSuperAdmin = user?.roles?.includes("super_admin") || false;
  const isTenantAdmin = user?.roles?.includes("tenant_admin") || false;

  const [activeTab, setActiveTab] = React.useState<Tab>("upload");
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [inputType, setInputType] = React.useState<"file" | "text">("file");
  const [textInput, setTextInput] = React.useState("");
  const [textTitle, setTextTitle] = React.useState("");
  const [uploadStatus, setUploadStatus] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [currentFileKey, setCurrentFileKey] = React.useState<string | null>(
    null,
  );
  // Static headers
  const staticHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "x-sdk-api-key": config?.apiKey || "",
  };

  // Dynamic replay headers
  const getReplayHeaders = () => ({
    "x-request-timestamp": Date.now().toString(),
    "x-request-nonce": generateNonce(),
  });

  // Combine static and dynamic headers
  const getHeaders = () => ({
    ...staticHeaders,
    ...getReplayHeaders(),
  });

  // Users state
  const [users, setUsers] = React.useState<User[]>([]);

  // Tenants state - now an array instead of single tenant
  const [tenants, setTenants] = React.useState<Tenant[]>([]);

  // Redirect if not admin - silently redirect without alert to avoid disrupting user flow
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      if (onNavigateToHome) onNavigateToHome();
    }
  }, [user, onNavigateToHome, isTenantAdmin]);

  React.useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "tenants") {
      fetchTenants();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/users`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        await handleErrors(response);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Cross-platform alert that works on web and native
  const showAlert = (title: string, message: string) => {
    if (
      Platform.OS === "web" &&
      typeof (globalThis as any)?.alert === "function"
    ) {
      (globalThis as any).alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/tenants`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        await handleErrors(response);
      }
      const data = await response.json();
      setTenants(data.tenants || data.data || []);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to load tenant information",
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "users") {
      await fetchUsers();
    } else if (activeTab === "tenants") {
      await fetchTenants();
    }
    setRefreshing(false);
  };

  // Poll for file processing status
  const pollFileStatus = async (fileKey: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const encodedKey = encodeURIComponent(fileKey);
        const response = await fetch(
          `${baseUrl}/embedding/status/${encodedKey}`,
          {
            headers: getHeaders(),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const { status, progress, message, metadata } = data.data;

          // Prefer chunk progress if available
          let displayProgress = progress;
          let chunkProgressText = "";
          if (metadata && typeof metadata.processedChunks === "number" && typeof metadata.totalChunks === "number" && metadata.totalChunks > 0) {
            displayProgress = Math.round((metadata.processedChunks / metadata.totalChunks) * 100);
            chunkProgressText = ` (${metadata.processedChunks}/${metadata.totalChunks} chunks)`;
          }

          setUploadStatus(message + chunkProgressText);
          setUploadProgress(displayProgress);

          if (status === "embedding_completed") {
            showAlert(
              "Success!",
              "File processed successfully! You can now query this document.",
            );
            setCurrentFileKey(null);
            setUploadStatus("");
            setUploadProgress(0);
            return; // Stop polling
          } else if (status === "failed") {
            showAlert("Processing Failed", data.data.error || "Unknown error");
            setCurrentFileKey(null);
            setUploadStatus("");
            setUploadProgress(0);
            return; // Stop polling
          }
        }

        // Continue polling if not completed
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setUploadStatus("Processing timeout - please check back later");
          setCurrentFileKey(null);
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !textTitle.trim()) {
      showAlert("Error", "Please provide both title and content");
      return;
    }

    setUploading(true);
    setUploadStatus("Processing text...");

    try {
      // Use the actual API endpoint for text submission
      const response = await fetch(`${baseUrl}/embedding/update-embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({
          text: textInput,
          title: textTitle,
        }),
      });

      if (!response.ok) {
        await handleErrors(response);
      }

      const data = await response.json();
      void data;

      showAlert(
        "Success",
        "Text processed and embeddings updated successfully",
      );
      setTextInput("");
      setTextTitle("");
      setUploadStatus("Completed");
      setUploadProgress(100);

      setTimeout(() => {
        setUploadStatus("");
        setUploadProgress(0);
      }, 3000);
    } catch (error: any) {
      showAlert("Error", error?.message || "Failed to process text");
    } finally {
      setUploading(false);
    }
  };

  // Web file input ref
  // Only define file input ref on web
  // Only define file input ref on web
  // @ts-ignore: DOM types only available on web
  const fileInputRef = Platform.OS === "web" ? React.useRef(null) : null;

  const handleUpload = async () => {
    if (Platform.OS === "web") {
      // @ts-ignore: DOM types only available on web
      if (fileInputRef && fileInputRef.current) fileInputRef.current.click();
      return;
    }
    // Native (mobile)
    setUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        // User cancelled the picker
        setUploading(false);
        return;
      }
      const file = result.assets[0];
      const fileName = file.name || "document.pdf";
      const fileType = file.mimeType || "application/pdf";
      const resp = await fetch(`${baseUrl}/file/presigned-url`, {
        method: "POST",
        body: JSON.stringify({
          fileName: fileName,
          fileType: fileType,
        }),
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
      });
      if (!resp.ok) {
        await handleErrors(resp);
      }
      const { uploadUrl, fileUrl, key } = await resp.json();
      void fileUrl;
      // Remove Authorization header for S3 pre-signed URL upload
      const { Authorization, ...headersWithoutAuth } = getHeaders();
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": `${file.mimeType}`,
          ...headersWithoutAuth,
        },
        body: {
          uri: file.uri,
          type: file.mimeType || "application/pdf",
          name: file.name,
        },
      });

      // File uploaded - start polling for processing status
      setCurrentFileKey(key);
      setUploadStatus("File uploaded! Processing and generating embeddings...");
      setUploadProgress(10);
      setUploading(false);

      showAlert(
        "Upload Complete!",
        `${file.name} uploaded successfully. Now processing and generating embeddings...`,
      );

      // Start polling for status
      pollFileStatus(key);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to pick document";
      showAlert("Error", errorMsg);
      setUploading(false);

      // Navigate to error page for critical errors
      if (
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("fetch") ||
        errorMsg.toLowerCase().includes("presign request failed")
      ) {
        setTimeout(() => {
          if (onNavigateToError) onNavigateToError();
        }, 2000);
      }
    }
  };

  // Web: handle file input change
  // @ts-ignore: DOM types only available on web
  const handleWebFileChange = async (e) => {
    // @ts-ignore: DOM types only available on web
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await uploadPdfWeb({
      file,
      baseUrl,
      getHeaders,
      setCurrentFileKey,
      setUploadStatus,
      setUploadProgress,
      setUploading,
      showAlert,
      pollFileStatus,
      onNavigateToError,
    });
  };

  const toggleUserRole = async (userId: string, currentRoles: string[]) => {
    try {
      const isTenantAdmin = currentRoles.includes("tenant_admin");
      const isSuperAdmin = currentRoles.includes("super_admin");

      let newRoles: string[];

      // If user is super admin, don't allow demotion from regular tenant admin
      if (isSuperAdmin) {
        Alert.alert("Error", "Cannot modify super admin from this interface");
        return;
      }

      // Toggle between employee and tenant_admin
      if (isTenantAdmin) {
        newRoles = currentRoles.filter((r) => r !== "tenant_admin");
        if (newRoles.length === 0) {
          newRoles = ["employee"];
        }
      } else {
        newRoles = [
          ...currentRoles.filter((r) => r !== "employee"),
          "tenant_admin",
        ];
      }

      const response = await fetch(`${baseUrl}/auth/users/${userId}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ roles: newRoles }),
      });

      if (!response.ok) {
        await handleErrors(response);
      }

      Alert.alert("Success", "User role updated successfully");
      fetchUsers();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update user role");
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${baseUrl}/auth/users/${userId}`, {
                method: "DELETE",
                headers: getHeaders(),
              });

              if (!response.ok) {
                await handleErrors(response);
              }

              Alert.alert("Success", "User deleted successfully");
              fetchUsers();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete user");
            }
          },
        },
      ],
    );
  };

  const deleteTenant = async (tenantId: string, tenantName: string) => {
    Alert.alert(
      "Delete Tenant",
      `Are you sure you want to delete tenant "${tenantName}"? This will affect all users in this tenant. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${baseUrl}/auth/tenants/${tenantId}`,
                {
                  method: "DELETE",
                  headers: getHeaders(),
                },
              );

              if (!response.ok) {
                await handleErrors(response);
              }

              Alert.alert("Success", "Tenant deleted successfully");
              fetchTenants();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete tenant");
            }
          },
        },
      ],
    );
  };

  const renderUploadTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Upload Documents</Text>
      <Text style={styles.sectionDescription}>
        Upload PDF documents to the knowledge base. Files will be processed and
        indexed automatically.
      </Text>

      {isSuperAdmin ? (
        <View style={styles.superAdminNotice}>
          <Text style={styles.superAdminNoticeIcon}>⚠️</Text>
          <Text style={styles.superAdminNoticeTitle}>
            Super Admin Upload Restriction
          </Text>
          <Text style={styles.superAdminNoticeText}>
            You cannot upload documents as a super admin because super admins
            are not associated with a specific tenant.
            {"\n\n"}
            Please log in as a tenant admin to upload documents to a specific
            tenant's knowledge base.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.inputTypeToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                inputType === "file" && styles.toggleButtonActive,
              ]}
              onPress={() => setInputType("file")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  inputType === "file" && styles.toggleButtonTextActive,
                ]}
              >
                File Upload
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                inputType === "text" && styles.toggleButtonActive,
              ]}
              onPress={() => setInputType("text")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  inputType === "text" && styles.toggleButtonTextActive,
                ]}
              >
                Text Input
              </Text>
            </TouchableOpacity>
          </View>

          {inputType === "file" ? (
            <>
              {Platform.OS === "web" && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={handleWebFileChange}
                  disabled={uploading || !!currentFileKey}
                />
              )}
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  (uploading || !!currentFileKey) && styles.uploadButtonDisabled,
                ]}
                onPress={handleUpload}
                disabled={uploading || !!currentFileKey}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>📄 Select PDF File</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a title"
                value={textTitle}
                onChangeText={setTextTitle}
                editable={!uploading}
              />

              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter text to embed..."
                value={textInput}
                onChangeText={setTextInput}
                multiline
                numberOfLines={6}
                editable={!uploading}
              />

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.uploadButtonDisabled,
                ]}
                onPress={handleTextSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>Submit Text</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {uploading && (
            <Text style={styles.uploadingText}>
              {inputType === "file"
                ? "Uploading file..."
                : "Processing text..."}
            </Text>
          )}

          {currentFileKey && uploadStatus && (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Processing Status</Text>
                <Text style={styles.statusProgress}>{uploadProgress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                />
              </View>
              <Text style={styles.statusMessage}>{uploadStatus}</Text>
              {uploadProgress < 100 && (
                <ActivityIndicator
                  size="small"
                  color="#2196f3"
                  style={styles.statusLoader}
                />
              )}
            </View>
          )}

          {/* Text input section for super admins */}
          {isSuperAdmin && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter text content"
                placeholderTextColor="#666"
                value={textInput}
                onChangeText={setTextInput}
                multiline
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter title"
                placeholderTextColor="#666"
                value={textTitle}
                onChangeText={setTextTitle}
                multiline
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleTextSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>✅ Submit Text</Text>
                )}
              </TouchableOpacity>

              {uploadStatus && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusMessage}>{uploadStatus}</Text>
                  {uploadProgress < 100 && (
                    <ActivityIndicator
                      size="small"
                      color="#2196f3"
                      style={styles.statusLoader}
                    />
                  )}
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderTenantsTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>
        {isSuperAdmin ? "All Tenants" : "Your Tenant"}
      </Text>
      <Text style={styles.sectionDescription}>
        {isSuperAdmin
          ? "View and manage all tenant configurations"
          : "View your tenant configuration"}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={styles.loader} />
      ) : tenants.length > 0 ? (
        tenants.map((tenant) => (
          <View key={tenant._id} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Tenant ID:</Text>
              <Text style={styles.cardValue}>{tenant.tenantId}</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Name:</Text>
              <Text style={styles.cardValue}>{tenant.name}</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>HMAC Secret:</Text>
              <Text style={styles.cardValueSecret}>
                {tenant.hmacSecret.substring(0, 20)}...
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Created:</Text>
              <Text style={styles.cardValue}>
                {new Date(tenant.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {isSuperAdmin && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTenant(tenant.tenantId, tenant.name)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete Tenant</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No tenant information available</Text>
      )}
    </ScrollView>
  );

  const renderUsersTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>User Management</Text>
      <Text style={styles.sectionDescription}>
        {isSuperAdmin
          ? "Manage all users across all tenants"
          : `Manage users in your tenant (${user?.tenantId})`}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={styles.loader} />
      ) : users.length > 0 ? (
        users.map((u) => (
          <View key={u._id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {u.firstName} {u.lastName}
              </Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              {isSuperAdmin && u.tenant?.tenantId && (
                <Text style={styles.userTenant}>
                  Tenant: {u.tenant.tenantId}
                </Text>
              )}
              <View style={styles.roleContainer}>
                {u.roles.includes("super_admin") && (
                  <Text style={styles.superAdminBadge}>SUPER ADMIN</Text>
                )}
                {u.roles.includes("tenant_admin") && (
                  <Text style={styles.adminBadge}>TENANT ADMIN</Text>
                )}
                {u.roles.includes("employee") && (
                  <Text style={styles.roleBadge}>EMPLOYEE</Text>
                )}
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  u.roles.includes("tenant_admin") && styles.roleButtonRemove,
                  u.roles.includes("super_admin") && styles.roleButtonDisabled,
                ]}
                onPress={() => toggleUserRole(u._id, u.roles)}
                disabled={u.roles.includes("super_admin")}
              >
                <Text style={styles.roleButtonText}>
                  {u.roles.includes("super_admin")
                    ? "Super Admin"
                    : u.roles.includes("tenant_admin")
                      ? "Remove Admin"
                      : "Make Admin"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteUserButton,
                  u.roles.includes("super_admin") && styles.roleButtonDisabled,
                ]}
                onPress={() =>
                  deleteUser(u._id, `${u.firstName} ${u.lastName}`)
                }
                disabled={u.roles.includes("super_admin")}
              >
                <Text style={styles.deleteUserButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No users found</Text>
      )}
    </ScrollView>
  );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSuperAdmin ? (
          <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
            <Text style={styles.backButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigateBack && onNavigateBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text
            style={[
              styles.adminBadgeHeader,
              isSuperAdmin
                ? styles.superAdminBadgeHeader
                : styles.tenantAdminBadgeHeader,
            ]}
          >
            {isSuperAdmin ? "SUPER ADMIN" : `${user?.tenantId} ADMIN`}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upload" && styles.tabActive]}
          onPress={() => setActiveTab("upload")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upload" && styles.tabTextActive,
            ]}
          >
            Upload
          </Text>
        </TouchableOpacity>

        {/* Only show Tenant tab for super admins */}
        {isSuperAdmin && (
          <TouchableOpacity
            style={[styles.tab, activeTab === "tenants" && styles.tabActive]}
            onPress={() => setActiveTab("tenants")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "tenants" && styles.tabTextActive,
              ]}
            >
              Tenants
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tab, activeTab === "users" && styles.tabActive]}
          onPress={() => setActiveTab("users")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "users" && styles.tabTextActive,
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "upload" && renderUploadTab()}
      {activeTab === "tenants" && isSuperAdmin && renderTenantsTab()}
      {activeTab === "users" && renderUsersTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#2196f3",
    fontSize: 16,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  adminBadgeHeader: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  superAdminBadgeHeader: {
    backgroundColor: "#9c27b0",
    color: "#fff",
  },
  tenantAdminBadgeHeader: {
    backgroundColor: "#2196f3",
    color: "#fff",
  },
  placeholder: {
    width: 60,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#252525",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2196f3",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#2196f3",
    fontWeight: "700",
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: "#555",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  cardLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  cardValueSecret: {
    fontSize: 14,
    color: "#2196f3",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  userCard: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  userTenant: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontStyle: "italic",
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  adminBadge: {
    backgroundColor: "#2196f3",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  superAdminBadge: {
    backgroundColor: "#9c27b0",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  roleBadge: {
    backgroundColor: "#444",
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  roleButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  roleButtonRemove: {
    backgroundColor: "#f44336",
  },
  roleButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  roleButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  superAdminNotice: {
    backgroundColor: "#2d2416",
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#9c6d1f",
    alignItems: "center",
  },
  superAdminNoticeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  superAdminNoticeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffb74d",
    marginBottom: 12,
    textAlign: "center",
  },
  superAdminNoticeText: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 22,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#9f4343ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffb3b3",
    fontSize: 14,
    fontWeight: "600",
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteUserButton: {
    backgroundColor: "#8b3a3a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteUserButtonText: {
    fontSize: 18,
  },
  statusCard: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusProgress: {
    color: "#2196f3",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196f3",
    borderRadius: 4,
  },
  statusMessage: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  statusLoader: {
    marginTop: 8,
  },
  textInputContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 16,
  },
  textInput: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputTypeToggle: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#3a3a3a",
  },
  toggleButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  inputLabel: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 120,
  },
});