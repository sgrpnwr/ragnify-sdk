"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ChatScreen;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _ChatPanel = _interopRequireDefault(require("../components/ChatPanel"));
var _LogoutButton = _interopRequireDefault(require("../components/LogoutButton"));
var _AuthContext = require("../context/AuthContext");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ChatScreen({
  onLogout,
  onNavigateToDashboard
}) {
  const {
    user,
    logout,
    isAdmin,
    isSuperAdmin,
    accessToken,
    config
  } = (0, _AuthContext.useSapientAuth)();
  _react.default.useEffect(() => {
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
  const getTenantName = tenantId => {
    if (!tenantId) return "";
    const parts = tenantId.split("-");
    if (parts.length > 1) {
      const namePart = parts[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return tenantId;
  };
  const tenantName = getTenantName(user === null || user === void 0 ? void 0 : user.tenantId);
  return /*#__PURE__*/_react.default.createElement(_reactNative.SafeAreaView, {
    style: styles.containerRoot
  }, /*#__PURE__*/_react.default.createElement(_reactNative.KeyboardAvoidingView, {
    style: {
      flex: 1
    },
    behavior: _reactNative.Platform.OS === "ios" ? "padding" : "height",
    keyboardVerticalOffset: _reactNative.Platform.OS === "ios" ? 0 : 24
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.header
  }, /*#__PURE__*/_react.default.createElement(_LogoutButton.default, {
    onLogout: handleLogout
  }), tenantName && /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.tenantBadge
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.tenantLabel
  }, "Tenant->"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.tenantName
  }, tenantName)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.headerSpacer
  }), isAdmin && /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    style: styles.dashboardButton,
    onPress: onNavigateToDashboard,
    disabled: !onNavigateToDashboard
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.dashboardButtonText
  }, "\u2699\uFE0F"))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.content
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.fullColumn
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.rightBottom
  }, /*#__PURE__*/_react.default.createElement(_ChatPanel.default, {
    accessToken: accessToken || "",
    baseUrl: (config === null || config === void 0 ? void 0 : config.baseUrl) || "http://localhost:8000",
    tenantId: (user === null || user === void 0 ? void 0 : user.tenantId) || ""
  }))))));
}
const styles = _reactNative.StyleSheet.create({
  containerRoot: {
    flex: 1,
    backgroundColor: "#1a1a1a"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#1a1a1a"
  },
  content: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1a1a1a"
  },
  leftColumn: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#eee"
  },
  rightColumn: {
    flex: 1,
    padding: 16
  },
  fullColumn: {
    flex: 1,
    padding: 16
  },
  rightTop: {
    marginBottom: 16
  },
  rightBottom: {
    flex: 1
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#fff"
  },
  subtitle: {
    fontSize: 18,
    color: "#999"
  },
  headerSpacer: {
    flex: 1
  },
  dashboardButton: {
    backgroundColor: "#2196f3",
    flexDirection: "row",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 6
  },
  dashboardButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600"
  },
  tenantBadge: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 40
  },
  tenantLabel: {
    fontSize: 11,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600"
  },
  tenantName: {
    fontSize: 14,
    color: "#2196f3",
    fontWeight: "700",
    letterSpacing: 0.5
  }
});
//# sourceMappingURL=ChatScreen.js.map