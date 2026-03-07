import React from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";

export default function ShimmerBox() {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 180],
  });
  return (
    <View style={styles.shimmerContainer}>
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: {
    height: 24,
    width: 120,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
    marginBottom: 2,
  },
  shimmer: {
    height: '100%',
    width: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
});