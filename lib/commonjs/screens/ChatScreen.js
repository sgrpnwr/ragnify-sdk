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
    style: styles.tenantBadge,
    pointerEvents: "none"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.tenantLabel
  }, "Workspace"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.tenantName
  }, tenantName)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.headerSpacer
  }), isAdmin && /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    style: styles.dashboardButton,
    onPress: onNavigateToDashboard,
    disabled: !onNavigateToDashboard
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.dashboardButtonText
  }, "Dashboard"))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.content
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.fullColumn
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.rightBottom
  }, /*#__PURE__*/_react.default.createElement(_ChatPanel.default, {
    accessToken: accessToken || "",
    baseUrl: (config === null || config === void 0 ? void 0 : config.baseUrl) || "https://ragnifyms.sgrpnwr.com",
    tenantId: (user === null || user === void 0 ? void 0 : user.tenantId) || ""
  }))))));
}
const styles = _reactNative.StyleSheet.create({
  containerRoot: {
    flex: 1,
    backgroundColor: "#FAFAFA"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    position: "relative"
  },
  content: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FAFAFA"
  },
  leftColumn: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E5E5E5"
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
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111111"
  },
  subtitle: {
    fontSize: 15,
    color: "#888888"
  },
  headerSpacer: {
    flex: 1
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
    borderColor: "#E5E5E5"
  },
  dashboardButtonText: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "500"
  },
  tenantBadge: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6
  },
  tenantLabel: {
    fontSize: 11,
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500"
  },
  tenantName: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "600"
  }
});
//# sourceMappingURL=ChatScreen.js.map