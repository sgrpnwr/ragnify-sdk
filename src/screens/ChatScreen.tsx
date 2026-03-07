import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import ChatPanel from "../components/ChatPanel";
import LogoutButton from "../components/LogoutButton";
import { useSapientAuth } from "../context/AuthContext";

type ChatScreenProps = {
  onLogout?: () => void;
  onNavigateToDashboard?: () => void;
};

export default function ChatScreen({
  onLogout,
  onNavigateToDashboard,
}: ChatScreenProps) {
  const { user, logout, isAdmin, isSuperAdmin, accessToken, config } =
    useSapientAuth();

  React.useEffect(() => {
    if (isSuperAdmin && onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  }, [isSuperAdmin, onNavigateToDashboard]);

  async function handleLogout() {
    await logout();
    if (onLogout) {
      onLogout();
    }
  }

  const getTenantName = (tenantId: string | undefined) => {
    if (!tenantId) return "";
    const parts = tenantId.split("-");
    if (parts.length > 1) {
      const namePart = parts[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return tenantId;
  };

  const tenantName = getTenantName(user?.tenantId);

  return (
    <SafeAreaView style={styles.containerRoot}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View style={styles.header}>
          {/* Left */}
          <LogoutButton onLogout={handleLogout} />

          {/* Center — absolutely positioned so it's always truly centered */}
          {tenantName && (
            <View style={styles.tenantBadge} pointerEvents="none">
              <Text style={styles.tenantLabel}>Workspace</Text>
              <Text style={styles.tenantName}>{tenantName}</Text>
            </View>
          )}

          {/* Right */}
          <View style={styles.headerSpacer} />
          {isAdmin && (
            <Pressable
              style={styles.dashboardButton}
              onPress={onNavigateToDashboard}
              disabled={!onNavigateToDashboard}
            >
              <Text style={styles.dashboardButtonText}>Dashboard</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.fullColumn}>
            <View style={styles.rightBottom}>
              <ChatPanel
                accessToken={accessToken || ""}
                baseUrl={config?.baseUrl || "https://ragnifyms.sgrpnwr.com"}
                tenantId={user?.tenantId || ""}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerRoot: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
  },
  leftColumn: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E5E5E5",
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
  fullColumn: {
    flex: 1,
    padding: 16,
  },
  rightTop: {
    marginBottom: 16,
  },
  rightBottom: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111111",
  },
  subtitle: {
    fontSize: 15,
    color: "#888888",
  },
  headerSpacer: {
    flex: 1,
  },
  dashboardButton: {
    backgroundColor: "#F4F4F4",
    flexDirection: "row",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  dashboardButtonText: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "500",
  },
  tenantBadge: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tenantLabel: {
    fontSize: 11,
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  tenantName: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "600",
  },
});
