import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
function LogoutButton({
  onLogout
}) {
  return /*#__PURE__*/React.createElement(Pressable, {
    onPress: onLogout,
    style: styles.button
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.text
  }, "Log out"));
}
export default /*#__PURE__*/React.memo(LogoutButton);
const styles = StyleSheet.create({
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