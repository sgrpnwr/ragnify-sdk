"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RegisterScreen;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _AuthContext = require("../context/AuthContext");
var _auth = require("../utils/auth");
var _general = require("../utils/general");
var _auth2 = require("../validators/auth");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const showAlert = (title, message) => {
  if (_reactNative.Platform.OS === "web" && typeof (globalThis === null || globalThis === void 0 ? void 0 : globalThis.alert) === "function") {
    globalThis.alert(`${title}: ${message}`);
  } else {
    _reactNative.Alert.alert(title, message);
  }
};
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
      const baseUrl = (config === null || config === void 0 ? void 0 : config.baseUrl) || "https://ragnifyms.sgrpnwr.com";
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sdk-api-key": (config === null || config === void 0 ? void 0 : config.apiKey) || "",
          "x-request-timestamp": Date.now().toString(),
          "x-request-nonce": (0, _general.generateNonce)()
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
        showAlert("Success", "User registered successfully");
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
      await (0, _general.handleErrors)(res);
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
    placeholderTextColor: "#AAAAAA",
    value: firstName,
    onChangeText: setFirstName,
    style: [styles.input, errors.firstName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.firstName && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.firstName) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Last name",
    placeholderTextColor: "#AAAAAA",
    value: lastName,
    onChangeText: setLastName,
    style: [styles.input, errors.lastName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.lastName && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.lastName) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Email",
    placeholderTextColor: "#AAAAAA",
    value: email,
    onChangeText: setEmail,
    style: [styles.input, errors.email ? styles.inputError : undefined],
    keyboardType: "email-address",
    autoCapitalize: "none"
  }), errors.email && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.email) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Password",
    placeholderTextColor: "#AAAAAA",
    value: password,
    onChangeText: setPassword,
    style: [styles.input, errors.password ? styles.inputError : undefined],
    secureTextEntry: true
  }), errors.password && !errors._general ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.fieldError
  }, errors.password) : null, /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    placeholder: "Confirm Password",
    placeholderTextColor: "#AAAAAA",
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
    backgroundColor: "#FAFAFA",
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
    fontSize: 40,
    fontWeight: "700",
    color: "#2196f3",
    letterSpacing: 0,
    textAlign: "center",
    marginBottom: 6
  },
  brandingTagline: {
    fontSize: 14,
    color: "#888888",
    letterSpacing: 0,
    textAlign: "center",
    fontWeight: "400"
  },
  form: {
    gap: 14,
    paddingHorizontal: 24
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginBottom: 8
  },
  input: {
    height: 50,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontSize: 15
  },
  inputError: {
    borderColor: "#D93025"
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  errorText: {
    color: "#D93025",
    textAlign: "center",
    fontSize: 14
  },
  fieldError: {
    color: "#D93025",
    fontSize: 13,
    marginTop: -8
  },
  button: {
    backgroundColor: "#111111",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
    height: 50,
    justifyContent: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  switchLink: {
    marginTop: 8,
    textAlign: "center",
    color: "#888888",
    fontSize: 14
  },
  switchLinkBold: {
    color: "#111111",
    fontWeight: "600"
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    gap: 10
  },
  logoContainer: {
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6
  },
  footerLogo: {
    width: 120,
    height: 40
  },
  creditText: {
    fontSize: 12,
    color: "#BBBBBB",
    fontWeight: "400"
  }
});
//# sourceMappingURL=RegisterScreen.js.map