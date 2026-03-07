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
  }, "Log out"));
}
var _default = exports.default = /*#__PURE__*/_react.default.memo(LogoutButton);
const styles = _reactNative.StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#F4F4F4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5"
  },
  text: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "500"
  }
});
//# sourceMappingURL=LogoutButton.js.map