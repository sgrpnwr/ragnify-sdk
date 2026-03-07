"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ShimmerBox;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ShimmerBox() {
  const shimmerAnim = _react.default.useRef(new _reactNative.Animated.Value(0)).current;
  _react.default.useEffect(() => {
    _reactNative.Animated.loop(_reactNative.Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 1200,
      easing: _reactNative.Easing.linear,
      useNativeDriver: true
    })).start();
  }, [shimmerAnim]);
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 180]
  });
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.shimmerContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
    style: [styles.shimmer, {
      transform: [{
        translateX
      }]
    }]
  }));
}
const styles = _reactNative.StyleSheet.create({
  shimmerContainer: {
    height: 24,
    width: 120,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
    marginBottom: 2
  },
  shimmer: {
    height: '100%',
    width: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    opacity: 0.7
  }
});
//# sourceMappingURL=ShimmerBox.js.map