"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function LogoutButton({
  onLogout
}) {
  return /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    onPress: onLogout,
    style: styles.button
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.text
  }, "\uD83D\uDEAA Logout"));
}
var _default = exports.default = /*#__PURE__*/_react.default.memo(LogoutButton);
const styles = _reactNative.StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#252525",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a"
  },
  text: {
    color: "#2196f3",
    fontSize: 15,
    fontWeight: "600"
  }
});
//# sourceMappingURL=LogoutButton.js.map