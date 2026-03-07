import React from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSapientAuth } from "../context/AuthContext";
import { extractUserFromResponse } from "../utils/auth";
import { generateNonce, handleErrors } from "../utils/general";
import { loginSchema } from "../validators/auth";

type Props = {
  onLoginSuccess?: (user: any) => void;
  onRegisterLinkPress?: () => void;
  onNavigateToError?: () => void;
};

export default function LoginScreen({
  onLoginSuccess,
  onRegisterLinkPress,
  onNavigateToError,
}: Props) {
  const { setUser, setTokens, config, organisationMetadata } = useSapientAuth();
  const [email, setEmail] = React.useState("");
  const [emailFocus, setEmailFocus] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordFocus, setPasswordFocus] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function handleLogin() {
    setLoading(true);
    setErrors({});

    // client-side validation
    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
    } catch (err: any) {
      const map: Record<string, string> = {};
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
      const baseUrl = config?.baseUrl || "https://ragnifyms.sgrpnwr.com";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-timestamp": Date.now().toString(),
          "x-request-nonce": generateNonce(),
          "x-sdk-api-key": config?.apiKey || "",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res?.ok) {
        const serverMsg = await handleErrors(res);
        setErrors({
          _general: String(serverMsg),
          email: String(serverMsg),
          password: String(serverMsg),
        });
        setLoading(false);
        return;
      }

      // navigate to home on successful login
      const data = await res.json();

      // extract tokens (support multiple possible response shapes)
      const accessToken =
        data?.data?.accessToken ??
        data?.accessToken ??
        data?.data?.access_token ??
        data?.access_token ??
        null;

      const refreshToken =
        data?.data?.refreshToken ??
        data?.data?.refereshToken ??
        data?.refreshToken ??
        data?.refresh_token ??
        data?.refereshToken ??
        null;

      const user = extractUserFromResponse(data);
      setUser(user);
      setTokens(accessToken, refreshToken);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err: any) {
      const errorMessage = err.message ?? String(err);
      setErrors({ _general: errorMessage });

      // Navigate to error page for critical errors
      if (
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("fetch")
      ) {
        if (onNavigateToError) onNavigateToError();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding Header */}
          <View style={styles.brandingContainer}>
            <Text style={styles.brandingText}>
              {organisationMetadata.companyName}
            </Text>
            <Text style={styles.brandingTagline}>
              {organisationMetadata.companyMotto}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Login</Text>
            {errors._general ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors._general}</Text>
              </View>
            ) : null}

            <TextInput
              placeholder="Email"
              placeholderTextColor="#AAAAAA"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              style={[
                styles.input,
                emailFocus && styles.inputFocus,
                errors.email ? styles.inputError : undefined,
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && !errors._general ? (
              <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}

            <TextInput
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              style={[
                styles.input,
                passwordFocus && styles.inputFocus,
                errors.password ? styles.inputError : undefined,
              ]}
              secureTextEntry
            />
            {errors.password && !errors._general ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>

            <Pressable onPress={onRegisterLinkPress}>
              <Text style={styles.switchLink}>
                Don't have an account?{" "}
                <Text style={styles.switchLinkBold}>Register</Text>
              </Text>
            </Pressable>
          </View>

          {/* Footer with Logo and Credit */}
          <View style={styles.footer}>
            {organisationMetadata.companyLogo ? (
              <View style={styles.logoContainer}>
                <Image
                  source={organisationMetadata.companyLogo}
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 16,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  brandingContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  brandingText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#2196f3",
    letterSpacing: 0,
    textAlign: "center",
    marginBottom: 6,
  },
  brandingTagline: {
    fontSize: 14,
    color: "#888888",
    letterSpacing: 0,
    textAlign: "center",
    fontWeight: "400",
  },
  form: {
    gap: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 4,
  },
  input: {
    height: 50,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontSize: 15,
  },
  inputFocus: {
    borderColor: "#2196f3",
    borderWidth: 2,
  },
  inputError: {
    borderColor: "#D93025",
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#D93025",
    textAlign: "center",
    fontSize: 14,
  },
  fieldError: {
    color: "#D93025",
    fontSize: 13,
    marginTop: -8,
  },
  button: {
    backgroundColor: "#111111",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
    height: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  switchLink: {
    marginTop: 8,
    textAlign: "center",
    color: "#888888",
    fontSize: 14,
  },
  switchLinkBold: {
    color: "#111111",
    fontWeight: "600",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  footerLogo: {
    width: 120,
    height: 40,
  },
  creditText: {
    fontSize: 12,
    color: "#BBBBBB",
    fontWeight: "400",
  },
});
