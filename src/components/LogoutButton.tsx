import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onLogout: () => void;
};

function LogoutButton({ onLogout }: Props) {
  return (
    <Pressable onPress={onLogout} style={styles.button}>
      <Text style={styles.text}>🚪 Logout</Text>
    </Pressable>
  );
}

export default React.memo(LogoutButton);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#252525",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  text: {
    color: "#2196f3",
    fontSize: 15,
    fontWeight: "600",
  },
});
