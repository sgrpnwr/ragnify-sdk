import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onLogout: () => void;
};

function LogoutButton({ onLogout }: Props) {
  return (
    <Pressable onPress={onLogout} style={styles.button}>
      <Text style={styles.text}>Log out</Text>
    </Pressable>
  );
}

export default React.memo(LogoutButton);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#F4F4F4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  text: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "500",
  },
});
