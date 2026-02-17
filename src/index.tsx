// Export core components
export { default as ChatScreen } from "./screens/ChatScreen";
export { default as DashboardScreen } from "./screens/DashboardScreen";
export { default as LoginScreen } from "./screens/LoginScreen";
export { default as RegisterScreen } from "./screens/RegisterScreen";

// Export context & hooks
export { SapientAuthProvider, useSapientAuth } from "./context/AuthContext";
export type { OrganisationMetadata, SapientUser } from "./context/AuthContext";

