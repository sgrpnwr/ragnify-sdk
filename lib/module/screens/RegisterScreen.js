import React from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSapientAuth } from "../context/AuthContext";
import { extractUserFromResponse } from "../utils/auth";
import { generateNonce, handleErrors } from "../utils/general";
import { registerSchema } from "../validators/auth";
const showAlert = (title, message) => {
  if (Platform.OS === "web" && typeof (globalThis === null || globalThis === void 0 ? void 0 : globalThis.alert) === "function") {
    globalThis.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};
export default function RegisterScreen({
  onRegisterSuccess,
  onLoginLinkPress,
  onNavigateToError
}) {
  const {
    setUser,
    setTokens,
    config,
    organisationMetadata
  } = useSapientAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  async function handleRegister() {
    setLoading(true);
    setErrors({});

    // client-side validation
    try {
      await registerSchema.validate({
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
          "x-request-nonce": generateNonce()
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
        const user = extractUserFromResponse(data);
        setUser(user);
        setTokens(accessToken, refreshToken);
        if (onRegisterSuccess) onRegisterSuccess(user);
        return;
      }
      await handleErrors(res);
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
  return /*#__PURE__*/React.createElement(SafeAreaView, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(KeyboardAvoidingView, {
    style: styles.keyboardAvoiding,
    behavior: Platform.OS === "ios" ? "padding" : undefined,
    keyboardVerticalOffset: Platform.OS === "ios" ? 60 : 0
  }, /*#__PURE__*/React.createElement(ScrollView, {
    contentContainerStyle: styles.scrollContent,
    keyboardShouldPersistTaps: "handled",
    showsVerticalScrollIndicator: false
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.brandingContainer
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.brandingText
  }, organisationMetadata.companyName), /*#__PURE__*/React.createElement(Text, {
    style: styles.brandingTagline
  }, organisationMetadata.companyMotto)), /*#__PURE__*/React.createElement(View, {
    style: styles.form
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.title
  }, "Register"), /*#__PURE__*/React.createElement(Text, {
    style: styles.subtitle
  }, "Create your account"), errors._general ? /*#__PURE__*/React.createElement(View, {
    style: styles.errorContainer
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.errorText
  }, errors._general)) : null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "First name",
    placeholderTextColor: "#AAAAAA",
    value: firstName,
    onChangeText: setFirstName,
    style: [styles.input, errors.firstName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.firstName && !errors._general ? /*#__PURE__*/React.createElement(Text, {
    style: styles.fieldError
  }, errors.firstName) : null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Last name",
    placeholderTextColor: "#AAAAAA",
    value: lastName,
    onChangeText: setLastName,
    style: [styles.input, errors.lastName ? styles.inputError : undefined],
    autoCapitalize: "words"
  }), errors.lastName && !errors._general ? /*#__PURE__*/React.createElement(Text, {
    style: styles.fieldError
  }, errors.lastName) : null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Email",
    placeholderTextColor: "#AAAAAA",
    value: email,
    onChangeText: setEmail,
    style: [styles.input, errors.email ? styles.inputError : undefined],
    keyboardType: "email-address",
    autoCapitalize: "none"
  }), errors.email && !errors._general ? /*#__PURE__*/React.createElement(Text, {
    style: styles.fieldError
  }, errors.email) : null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Password",
    placeholderTextColor: "#AAAAAA",
    value: password,
    onChangeText: setPassword,
    style: [styles.input, errors.password ? styles.inputError : undefined],
    secureTextEntry: true
  }), errors.password && !errors._general ? /*#__PURE__*/React.createElement(Text, {
    style: styles.fieldError
  }, errors.password) : null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Confirm Password",
    placeholderTextColor: "#AAAAAA",
    value: confirmPassword,
    onChangeText: setConfirmPassword,
    style: [styles.input, errors.confirmPassword ? styles.inputError : undefined],
    secureTextEntry: true
  }), errors.confirmPassword && !errors._general ? /*#__PURE__*/React.createElement(Text, {
    style: styles.fieldError
  }, errors.confirmPassword) : null, /*#__PURE__*/React.createElement(Pressable, {
    style: [styles.button, loading && styles.buttonDisabled],
    onPress: handleRegister,
    disabled: loading
  }, loading ? /*#__PURE__*/React.createElement(ActivityIndicator, {
    size: "small",
    color: "#fff"
  }) : /*#__PURE__*/React.createElement(Text, {
    style: styles.buttonText
  }, "Register")), /*#__PURE__*/React.createElement(Pressable, {
    onPress: onLoginLinkPress
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.switchLink
  }, "Already have an account?", " ", /*#__PURE__*/React.createElement(Text, {
    style: styles.switchLinkBold
  }, "Login")))), /*#__PURE__*/React.createElement(View, {
    style: styles.footer
  }, organisationMetadata.companyLogo ? /*#__PURE__*/React.createElement(View, {
    style: styles.logoContainer
  }, /*#__PURE__*/React.createElement(Image, {
    source: organisationMetadata.companyLogo,
    style: styles.footerLogo,
    resizeMode: "contain"
  })) : null, /*#__PURE__*/React.createElement(Text, {
    style: styles.creditText
  }, "Made by ", organisationMetadata.madeBy)))));
}
const styles = StyleSheet.create({
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