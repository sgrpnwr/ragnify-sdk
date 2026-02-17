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
  }, "\uD83D\uDEAA Logout"));
}
export default /*#__PURE__*/React.memo(LogoutButton);
const styles = StyleSheet.create({
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