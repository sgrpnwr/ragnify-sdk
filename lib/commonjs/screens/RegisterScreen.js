"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RegisterScreen;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _AuthContext = require("../context/AuthContext");
var _auth = require("../utils/auth");
var _auth2 = require("../validators/auth");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function RegisterScreen({
  onRegisterSuccess,
  onLoginLinkPress,
  onNavigateToError
}) {
  const {
    setUser,
    setTokens,
    config,
    organisationMetadata
  } = (0, _AuthContext.useSapientAuth)();
  const [email, setEmail] = _react.default.useState("");
  const [password, setPassword] = _react.default.useState("");
  const [confirmPassword, setConfirmPassword] = _react.default.useState("");
  const [firstName, setFirstName] = _react.default.useState("");
  const [lastName, setLastName] = _react.default.useState("");
  const [loading, setLoading] = _react.default.useState(false);
  const [errors, setErrors] = _react.default.useState({});
  async function handleRegister() {
    setLoading(true);
    setErrors({});

    // client-side validation
    try {
      await _auth2.registerSchema.validate({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      }, {
        abortEarly: false
      });
    } catch (err) {
      const map = {};
      if (Array.isArray(err.inner)) {
        for (const e of err.inner) {
          if (e.path) map[e.path] = e.message;
        }
      } else {
        map._general = err.message || "Validation error";
      }
      setErrors(map);
      setLoading(false);
      return;
    }
    try {
      const baseUrl = (config === null || config === void 0 ? void 0 : config.baseUrl) || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-sdk-api-key': (config === null || config === void 0 ? void 0 : config.apiKey) || ""
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        })
      });
      if (res.status === 201) {
        var _data$data, _data$data2, _data$data3;
        _reactNative.Alert.alert("Success", "User registered successfully");
        const data = await res.json().catch(() => ({}));

        // extract tokens if present
        const accessToken = (data === null || data === void 0 || (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.accessToken) ?? (data === null || data === void 0 ? void 0 : data.accessToken) ?? null;
        const refreshToken = (data === null || data === void 0 || (_data$data2 = data.data) === null || _data$data2 === void 0 ? void 0 : _data$data2.refreshToken) ?? (data === null || data === void 0 || (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.refereshToken) ?? (data === null || data === void 0 ? void 0 : data.refreshToken) ?? (data === null || data === void 0 ? void 0 : data.refereshToken) ?? null;
        const user = (0, _auth.extractUserFromResponse)(data);
        setUser(user);
        setTokens(accessToken, refreshToken);
        if (onRegisterSuccess) onRegisterSuccess(user);
        return;
      }
      const text = await res.text();
      throw new Error(text || res.statusText || `Request failed with status ${res.status}`);
    } catch (err) {
      const errorMessage = err.message ?? String(err);
      setErrors({
        _general: errorMessage
      });

      // Navigate to error page for critical errors
      if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
        if (onNavigateToError) onNavigateToError();
      }
    } finally {
      setLoading(false);
    }
  }
  return /*#__PURE__*/_react.default.createElement(_reactNative.SafeAreaView, {
    style: styles.container
  }, /*#__PURE__*/_react.default.createElement(_reactNative.KeyboardAvoidingView, {
    style: styles.keyboardAvoiding,
    behavior: _reactNative.Platform.OS === "ios" ? "padding" : undefined,
    keyboardVerticalOffset: _reactNative.Platform.OS === "ios" ? 60 : 0
  }, /*#__PURE__*/_react.default.createElement(_reactNative.ScrollView, {
    contentContainerStyle: styles.scrollContent,
    keyboardShouldPersistTaps: "handled",
    showsVerticalScrollIndicator: false
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.brandingContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.brandingText
  }, organisationMetadata.companyName), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.brandingTagline
  }, organisationMetadata.companyMotto)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.form
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.title
  }, "Register"), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.subtitle
  }, "Create your account"), errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.errorContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.errorText
  }, errors._general)) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "First name",
    placeholderTextColor: "#666",
    value: firstName,
    onChangeText: setFirstName,
    style: [styles.input, errors.firstName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.firstName && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.firstName) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Last name",
    placeholderTextColor: "#666",
    value: lastName,
    onChangeText: setLastName,
    style: [styles.input, errors.lastName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.lastName && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.lastName) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Email",
    placeholderTextColor: "#666",
    value: email,
    onChangeText: setEmail,
    style: [styles.input, errors.email ? styles.inputError : undefined],
    keyboardType: "email-address",
    autoCapitalize: "none"
  }), errors.email && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.email) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Password",
    placeholderTextColor: "#666",
    value: password,
    onChangeText: setPassword,
    style: [styles.input, errors.password ? styles.inputError : undefined],
    secureTextEntry: true
  }), errors.password && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.password) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Confirm Password",
    placeholderTextColor: "#666",
    value: confirmPassword,
    onChangeText: setConfirmPassword,
    style: [styles.input, errors.confirmPassword ? styles.inputError : undefined],
    secureTextEntry: true
  }), errors.confirmPassword && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.confirmPassword) : null, /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    style: [styles.button, loading && styles.buttonDisabled],
    onPress: handleRegister,
    disabled: loading
  }, loading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    size: "small",
    color: "#fff"
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.buttonText
  }, "Register")), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    onPress: onLoginLinkPress
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.switchLink
  }, "Already have an account?", " ", /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.switchLinkBold
  }, "Login")))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.footer
  }, organisationMetadata.companyLogo ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.logoContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    source: organisationMetadata.companyLogo,
    style: styles.footerLogo,
    resizeMode: "contain"
  })) : null, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.creditText
  }, "Made by ", organisationMetadata.madeBy)))));
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16
  },
  keyboardAvoiding: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40
  },
  brandingContainer: {
    alignItems: "center",
    marginBottom: 48
  },
  brandingText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#2196f3",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8
  },
  brandingTagline: {
    fontSize: 14,
    color: "#999",
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "300"
  },
  form: {
    gap: 14,
    paddingHorizontal: 24
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 12
  },
  input: {
    height: 50,
    borderColor: "#3a3a3a",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#252525",
    color: "#fff",
    fontSize: 15
  },
  inputError: {
    borderColor: "#ff6b6b"
  },
  errorContainer: {
    backgroundColor: "#2a1a1a",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ff6b6b"
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    fontSize: 14
  },
  fieldError: {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: -8
  },
  button: {
    backgroundColor: "#2196f3",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    height: 50,
    justifyContent: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  switchLink: {
    marginTop: 8,
    textAlign: "center",
    color: "#999",
    fontSize: 15
  },
  switchLinkBold: {
    color: "#2196f3",
    fontWeight: "600"
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
    gap: 12
  },
  logoContainer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  footerLogo: {
    width: 120,
    height: 40
  },
  creditText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400"
  }
});
//# sourceMappingURL=RegisterScreen.js.map