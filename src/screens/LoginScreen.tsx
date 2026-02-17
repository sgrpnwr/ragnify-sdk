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
  const [password, setPassword] = React.useState("");
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
      const baseUrl = config?.baseUrl || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res?.ok) {
        const errJson = await res.json().catch(() => null);
        const serverMsg =
          errJson?.errorMessage ??
          errJson?.message ??
          (await res.text().catch(() => null)) ??
          res.statusText ??
          `Login failed ${res.status}`;
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
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
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
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
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
            <Text style={styles.creditText}>
              Made by {organisationMetadata.madeBy}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
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
    fontSize: 48,
    fontWeight: "800",
    color: "#2196f3",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  brandingTagline: {
    fontSize: 14,
    color: "#999",
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "300",
  },
  form: {
    gap: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  input: {
    height: 50,
    borderColor: "#3a3a3a",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#252525",
    color: "#fff",
    fontSize: 15,
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorContainer: {
    backgroundColor: "#2a1a1a",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    fontSize: 14,
  },
  fieldError: {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: -8,
  },
  button: {
    backgroundColor: "#2196f3",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    height: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchLink: {
    marginTop: 8,
    textAlign: "center",
    color: "#999",
    fontSize: 15,
  },
  switchLinkBold: {
    color: "#2196f3",
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  footerLogo: {
    width: 120,
    height: 40,
  },
  creditText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
  },
});
