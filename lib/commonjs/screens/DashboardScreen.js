"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AdminDashboard;
var DocumentPicker = _interopRequireWildcard(require("expo-document-picker"));
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _AuthContext = require("../context/AuthContext");
var _general = require("../utils/general");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function AdminDashboard({
  onLogout,
  onNavigateBack,
  onNavigateToHome,
  onNavigateToError
}) {
  var _user$roles, _user$roles2;
  const {
    user,
    accessToken,
    logout,
    config
  } = (0, _AuthContext.useSapientAuth)();
  const baseUrl = (config === null || config === void 0 ? void 0 : config.baseUrl) || "http://localhost:8000";

  // Check if user is super admin
  const isSuperAdmin = (user === null || user === void 0 || (_user$roles = user.roles) === null || _user$roles === void 0 ? void 0 : _user$roles.includes("super_admin")) || false;
  const isTenantAdmin = (user === null || user === void 0 || (_user$roles2 = user.roles) === null || _user$roles2 === void 0 ? void 0 : _user$roles2.includes("tenant_admin")) || false;
  const [activeTab, setActiveTab] = _react.default.useState("upload");
  const [uploading, setUploading] = _react.default.useState(false);
  const [loading, setLoading] = _react.default.useState(false);
  const [refreshing, setRefreshing] = _react.default.useState(false);
  const [inputType, setInputType] = _react.default.useState("file");
  const [textInput, setTextInput] = _react.default.useState("");
  const [textTitle, setTextTitle] = _react.default.useState("");
  const [uploadStatus, setUploadStatus] = _react.default.useState("");
  const [uploadProgress, setUploadProgress] = _react.default.useState(0);
  const [currentFileKey, setCurrentFileKey] = _react.default.useState(null);
  const mandatoryHeaders = {
    "x-request-timestamp": Date.now().toString(),
    "x-request-nonce": (0, _general.generateNonce)(),
    Authorization: `Bearer ${accessToken}`,
    "x-sdk-api-key": (config === null || config === void 0 ? void 0 : config.apiKey) || ""
  };

  // Users state
  const [users, setUsers] = _react.default.useState([]);

  // Tenants state - now an array instead of single tenant
  const [tenants, setTenants] = _react.default.useState([]);

  // Redirect if not admin - silently redirect without alert to avoid disrupting user flow
  _react.default.useEffect(() => {
    if (user && !user.isAdmin) {
      if (onNavigateToHome) onNavigateToHome();
    }
  }, [user, onNavigateToHome, isTenantAdmin]);
  _react.default.useEffect(() => {
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
        headers: mandatoryHeaders
      });
      if (!response.ok) {
        await (0, _general.handleErrors)(response);
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      _reactNative.Alert.alert("Error", (error === null || error === void 0 ? void 0 : error.message) || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Cross-platform alert that works on web and native
  const showAlert = (title, message) => {
    if (_reactNative.Platform.OS === "web" && typeof (globalThis === null || globalThis === void 0 ? void 0 : globalThis.alert) === "function") {
      globalThis.alert(`${title}: ${message}`);
    } else {
      _reactNative.Alert.alert(title, message);
    }
  };
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/tenants`, {
        headers: mandatoryHeaders
      });
      if (!response.ok) {
        await (0, _general.handleErrors)(response);
      }
      const data = await response.json();
      setTenants(data.tenants || data.data || []);
    } catch (error) {
      _reactNative.Alert.alert("Error", (error === null || error === void 0 ? void 0 : error.message) || "Failed to load tenant information");
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
  const pollFileStatus = async fileKey => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;
    const poll = async () => {
      try {
        const encodedKey = encodeURIComponent(fileKey);
        const response = await fetch(`${baseUrl}/embedding/status/${encodedKey}`, {
          headers: mandatoryHeaders
        });
        if (response.ok) {
          const data = await response.json();
          const {
            status,
            progress,
            message
          } = data.data;
          setUploadStatus(message);
          setUploadProgress(progress);
          if (status === "embedding_completed") {
            showAlert("Success!", "File processed successfully! You can now query this document.");
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
          ...mandatoryHeaders
        },
        body: JSON.stringify({
          text: textInput,
          title: textTitle
        })
      });
      if (!response.ok) {
        await (0, _general.handleErrors)(response);
      }
      const data = await response.json();
      void data;
      showAlert("Success", "Text processed and embeddings updated successfully");
      setTextInput("");
      setTextTitle("");
      setUploadStatus("Completed");
      setUploadProgress(100);
      setTimeout(() => {
        setUploadStatus("");
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      showAlert("Error", (error === null || error === void 0 ? void 0 : error.message) || "Failed to process text");
    } finally {
      setUploading(false);
    }
  };
  const handleUpload = async () => {
    setUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true
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
          fileType: fileType
        }),
        headers: {
          "Content-Type": "application/json",
          ...mandatoryHeaders
        }
      });
      if (!resp.ok) {
        await (0, _general.handleErrors)(resp);
      }
      const {
        uploadUrl,
        fileUrl,
        key
      } = await resp.json();
      void fileUrl;
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": `${file.mimeType}`,
          ...mandatoryHeaders
        },
        body: {
          uri: file.uri,
          type: file.mimeType || "application/pdf",
          name: file.name
        }
      });

      // File uploaded - start polling for processing status
      setCurrentFileKey(key);
      setUploadStatus("File uploaded! Processing and generating embeddings...");
      setUploadProgress(10);
      setUploading(false);
      showAlert("Upload Complete!", `${file.name} uploaded successfully. Now processing and generating embeddings...`);

      // Start polling for status
      pollFileStatus(key);
    } catch (error) {
      const errorMsg = (error === null || error === void 0 ? void 0 : error.message) || "Failed to pick document";
      showAlert("Error", errorMsg);
      setUploading(false);

      // Navigate to error page for critical errors
      if (errorMsg.toLowerCase().includes("network") || errorMsg.toLowerCase().includes("fetch") || errorMsg.toLowerCase().includes("presign request failed")) {
        setTimeout(() => {
          if (onNavigateToError) onNavigateToError();
        }, 2000);
      }
    }
  };
  const toggleUserRole = async (userId, currentRoles) => {
    try {
      const isTenantAdmin = currentRoles.includes("tenant_admin");
      const isSuperAdmin = currentRoles.includes("super_admin");
      let newRoles;

      // If user is super admin, don't allow demotion from regular tenant admin
      if (isSuperAdmin) {
        _reactNative.Alert.alert("Error", "Cannot modify super admin from this interface");
        return;
      }

      // Toggle between employee and tenant_admin
      if (isTenantAdmin) {
        newRoles = currentRoles.filter(r => r !== "tenant_admin");
        if (newRoles.length === 0) {
          newRoles = ["employee"];
        }
      } else {
        newRoles = [...currentRoles.filter(r => r !== "employee"), "tenant_admin"];
      }
      const response = await fetch(`${baseUrl}/auth/users/${userId}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...mandatoryHeaders
        },
        body: JSON.stringify({
          roles: newRoles
        })
      });
      if (!response.ok) {
        await (0, _general.handleErrors)(response);
      }
      _reactNative.Alert.alert("Success", "User role updated successfully");
      fetchUsers();
    } catch (error) {
      _reactNative.Alert.alert("Error", error.message || "Failed to update user role");
    }
  };
  const deleteUser = async (userId, userName) => {
    _reactNative.Alert.alert("Delete User", `Are you sure you want to delete ${userName}? This action cannot be undone.`, [{
      text: "Cancel",
      style: "cancel"
    }, {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const response = await fetch(`${baseUrl}/auth/users/${userId}`, {
            method: "DELETE",
            headers: mandatoryHeaders
          });
          if (!response.ok) {
            await (0, _general.handleErrors)(response);
          }
          _reactNative.Alert.alert("Success", "User deleted successfully");
          fetchUsers();
        } catch (error) {
          _reactNative.Alert.alert("Error", error.message || "Failed to delete user");
        }
      }
    }]);
  };
  const deleteTenant = async (tenantId, tenantName) => {
    _reactNative.Alert.alert("Delete Tenant", `Are you sure you want to delete tenant "${tenantName}"? This will affect all users in this tenant. This action cannot be undone.`, [{
      text: "Cancel",
      style: "cancel"
    }, {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const response = await fetch(`${baseUrl}/auth/tenants/${tenantId}`, {
            method: "DELETE",
            headers: mandatoryHeaders
          });
          if (!response.ok) {
            await (0, _general.handleErrors)(response);
          }
          _reactNative.Alert.alert("Success", "Tenant deleted successfully");
          fetchTenants();
        } catch (error) {
          _reactNative.Alert.alert("Error", error.message || "Failed to delete tenant");
        }
      }
    }]);
  };
  const renderUploadTab = () => /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.tabContent
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionTitle
  }, "Upload Documents"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionDescription
  }, "Upload PDF documents to the knowledge base. Files will be processed and indexed automatically."), isSuperAdmin ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.superAdminNotice
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.superAdminNoticeIcon
  }, "\u26A0\uFE0F"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.superAdminNoticeTitle
  }, "Super Admin Upload Restriction"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.superAdminNoticeText
  }, "You cannot upload documents as a super admin because super admins are not associated with a specific tenant.", "\n\n", "Please log in as a tenant admin to upload documents to a specific tenant's knowledge base.")) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.inputTypeToggle
  }, /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.toggleButton, inputType === "file" && styles.toggleButtonActive],
    onPress: () => setInputType("file")
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.toggleButtonText, inputType === "file" && styles.toggleButtonTextActive]
  }, "File Upload")), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.toggleButton, inputType === "text" && styles.toggleButtonActive],
    onPress: () => setInputType("text")
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.toggleButtonText, inputType === "text" && styles.toggleButtonTextActive]
  }, "Text Input"))), inputType === "file" ? /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.uploadButton, (uploading || !!currentFileKey) && styles.uploadButtonDisabled],
    onPress: handleUpload,
    disabled: uploading || !!currentFileKey
  }, uploading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: "#fff"
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.uploadButtonText
  }, "\uD83D\uDCC4 Select PDF File")) : /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.textInputContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.inputLabel
  }, "Title"), /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    style: styles.textInput,
    placeholder: "Enter a title",
    value: textTitle,
    onChangeText: setTextTitle,
    editable: !uploading
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.inputLabel
  }, "Content"), /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    style: [styles.textInput, styles.textArea],
    placeholder: "Enter text to embed...",
    value: textInput,
    onChangeText: setTextInput,
    multiline: true,
    numberOfLines: 6,
    editable: !uploading
  }), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.uploadButton, uploading && styles.uploadButtonDisabled],
    onPress: handleTextSubmit,
    disabled: uploading
  }, uploading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: "#fff"
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.uploadButtonText
  }, "Submit Text"))), uploading && /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.uploadingText
  }, inputType === "file" ? "Uploading file..." : "Processing text..."), currentFileKey && uploadStatus && /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.statusCard
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.statusHeader
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.statusTitle
  }, "Processing Status"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.statusProgress
  }, uploadProgress, "%")), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.progressBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.progressFill, {
      width: `${uploadProgress}%`
    }]
  })), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.statusMessage
  }, uploadStatus), uploadProgress < 100 && /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    size: "small",
    color: "#2196f3",
    style: styles.statusLoader
  })), isSuperAdmin && /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.textInputContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    style: styles.textInput,
    placeholder: "Enter text content",
    placeholderTextColor: "#666",
    value: textInput,
    onChangeText: setTextInput,
    multiline: true
  }), /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    style: styles.textInput,
    placeholder: "Enter title",
    placeholderTextColor: "#666",
    value: textTitle,
    onChangeText: setTextTitle,
    multiline: true
  }), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: styles.submitButton,
    onPress: handleTextSubmit,
    disabled: uploading
  }, uploading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: "#fff"
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.submitButtonText
  }, "\u2705 Submit Text")), uploadStatus && /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.statusCard
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.statusMessage
  }, uploadStatus), uploadProgress < 100 && /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    size: "small",
    color: "#2196f3",
    style: styles.statusLoader
  })))));
  const renderTenantsTab = () => /*#__PURE__*/_react.default.createElement(_reactNative.ScrollView, {
    style: styles.tabContent,
    refreshControl: /*#__PURE__*/_react.default.createElement(_reactNative.RefreshControl, {
      refreshing: refreshing,
      onRefresh: onRefresh
    })
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionTitle
  }, isSuperAdmin ? "All Tenants" : "Your Tenant"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionDescription
  }, isSuperAdmin ? "View and manage all tenant configurations" : "View your tenant configuration"), loading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    size: "large",
    color: "#2196f3",
    style: styles.loader
  }) : tenants.length > 0 ? tenants.map(tenant => /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    key: tenant._id,
    style: styles.card
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.cardRow
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardLabel
  }, "Tenant ID:"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardValue
  }, tenant.tenantId)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.cardRow
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardLabel
  }, "Name:"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardValue
  }, tenant.name)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.cardRow
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardLabel
  }, "HMAC Secret:"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardValueSecret
  }, tenant.hmacSecret.substring(0, 20), "...")), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.cardRow
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardLabel
  }, "Created:"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cardValue
  }, new Date(tenant.createdAt).toLocaleDateString())), isSuperAdmin && /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: styles.deleteButton,
    onPress: () => deleteTenant(tenant.tenantId, tenant.name)
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.deleteButtonText
  }, "\uD83D\uDDD1\uFE0F Delete Tenant")))) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.emptyText
  }, "No tenant information available"));
  const renderUsersTab = () => /*#__PURE__*/_react.default.createElement(_reactNative.ScrollView, {
    style: styles.tabContent,
    refreshControl: /*#__PURE__*/_react.default.createElement(_reactNative.RefreshControl, {
      refreshing: refreshing,
      onRefresh: onRefresh
    })
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionTitle
  }, "User Management"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.sectionDescription
  }, isSuperAdmin ? "Manage all users across all tenants" : `Manage users in your tenant (${user === null || user === void 0 ? void 0 : user.tenantId})`), loading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    size: "large",
    color: "#2196f3",
    style: styles.loader
  }) : users.length > 0 ? users.map(u => {
    var _u$tenant;
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      key: u._id,
      style: styles.userCard
    }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.userInfo
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.userName
    }, u.firstName, " ", u.lastName), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.userEmail
    }, u.email), isSuperAdmin && ((_u$tenant = u.tenant) === null || _u$tenant === void 0 ? void 0 : _u$tenant.tenantId) && /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.userTenant
    }, "Tenant: ", u.tenant.tenantId), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.roleContainer
    }, u.roles.includes("super_admin") && /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.superAdminBadge
    }, "SUPER ADMIN"), u.roles.includes("tenant_admin") && /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.adminBadge
    }, "TENANT ADMIN"), u.roles.includes("employee") && /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.roleBadge
    }, "EMPLOYEE"))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.userActions
    }, /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
      style: [styles.roleButton, u.roles.includes("tenant_admin") && styles.roleButtonRemove, u.roles.includes("super_admin") && styles.roleButtonDisabled],
      onPress: () => toggleUserRole(u._id, u.roles),
      disabled: u.roles.includes("super_admin")
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.roleButtonText
    }, u.roles.includes("super_admin") ? "Super Admin" : u.roles.includes("tenant_admin") ? "Remove Admin" : "Make Admin")), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
      style: [styles.deleteUserButton, u.roles.includes("super_admin") && styles.roleButtonDisabled],
      onPress: () => deleteUser(u._id, `${u.firstName} ${u.lastName}`),
      disabled: u.roles.includes("super_admin")
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.deleteUserButtonText
    }, "\uD83D\uDDD1\uFE0F"))));
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.emptyText
  }, "No users found"));
  if (!(user !== null && user !== void 0 && user.isAdmin)) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.header
  }, isSuperAdmin ? /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: styles.backButton,
    onPress: handleLogout
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.backButtonText
  }, "\uD83D\uDEAA Logout")) : /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: styles.backButton,
    onPress: () => onNavigateBack && onNavigateBack()
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.backButtonText
  }, "\u2190 Back")), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.headerCenter
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.headerTitle
  }, "Admin Dashboard"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.adminBadgeHeader, isSuperAdmin ? styles.superAdminBadgeHeader : styles.tenantAdminBadgeHeader]
  }, isSuperAdmin ? "SUPER ADMIN" : `${user === null || user === void 0 ? void 0 : user.tenantId} ADMIN`)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.placeholder
  })), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.tabBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.tab, activeTab === "upload" && styles.tabActive],
    onPress: () => setActiveTab("upload")
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.tabText, activeTab === "upload" && styles.tabTextActive]
  }, "Upload")), isSuperAdmin && /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.tab, activeTab === "tenants" && styles.tabActive],
    onPress: () => setActiveTab("tenants")
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.tabText, activeTab === "tenants" && styles.tabTextActive]
  }, "Tenants")), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.tab, activeTab === "users" && styles.tabActive],
    onPress: () => setActiveTab("users")
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.tabText, activeTab === "users" && styles.tabTextActive]
  }, "Users"))), activeTab === "upload" && renderUploadTab(), activeTab === "tenants" && isSuperAdmin && renderTenantsTab(), activeTab === "users" && renderUsersTab());
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a"
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
    borderBottomColor: "#333"
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    color: "#2196f3",
    fontSize: 16
  },
  headerCenter: {
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  adminBadgeHeader: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden"
  },
  superAdminBadgeHeader: {
    backgroundColor: "#9c27b0",
    color: "#fff"
  },
  tenantAdminBadgeHeader: {
    backgroundColor: "#2196f3",
    color: "#fff"
  },
  placeholder: {
    width: 60
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#252525",
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  tabActive: {
    borderBottomColor: "#2196f3"
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500"
  },
  tabTextActive: {
    color: "#2196f3",
    fontWeight: "700"
  },
  tabContent: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    lineHeight: 20
  },
  uploadButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  uploadButtonDisabled: {
    backgroundColor: "#555"
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  uploadingText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12
  },
  loader: {
    marginTop: 40
  },
  card: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333"
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  cardLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500"
  },
  cardValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    textAlign: "right"
  },
  cardValueSecret: {
    fontSize: 14,
    color: "#2196f3",
    fontWeight: "600",
    fontFamily: "monospace"
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
    alignItems: "center"
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8
  },
  userTenant: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontStyle: "italic"
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  adminBadge: {
    backgroundColor: "#2196f3",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden"
  },
  superAdminBadge: {
    backgroundColor: "#9c27b0",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden"
  },
  roleBadge: {
    backgroundColor: "#444",
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden"
  },
  roleButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12
  },
  roleButtonRemove: {
    backgroundColor: "#f44336"
  },
  roleButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5
  },
  roleButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40
  },
  superAdminNotice: {
    backgroundColor: "#2d2416",
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#9c6d1f",
    alignItems: "center"
  },
  superAdminNoticeIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  superAdminNoticeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffb74d",
    marginBottom: 12,
    textAlign: "center"
  },
  superAdminNoticeText: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 22,
    textAlign: "center"
  },
  deleteButton: {
    backgroundColor: "#9f4343ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center"
  },
  deleteButtonText: {
    color: "#ffb3b3",
    fontSize: 14,
    fontWeight: "600"
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  deleteUserButton: {
    backgroundColor: "#8b3a3a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteUserButtonText: {
    fontSize: 18
  },
  statusCard: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a"
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  statusTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  statusProgress: {
    color: "#2196f3",
    fontSize: 16,
    fontWeight: "bold"
  },
  progressBar: {
    height: 8,
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196f3",
    borderRadius: 4
  },
  statusMessage: {
    color: "#999",
    fontSize: 14,
    textAlign: "center"
  },
  statusLoader: {
    marginTop: 8
  },
  textInputContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 16
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
    textAlignVertical: "top"
  },
  submitButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  inputTypeToggle: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 4
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6
  },
  toggleButtonActive: {
    backgroundColor: "#3a3a3a"
  },
  toggleButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600"
  },
  toggleButtonTextActive: {
    color: "#fff"
  },
  inputLabel: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600"
  },
  textArea: {
    minHeight: 120
  }
});
//# sourceMappingURL=DashboardScreen.js.map