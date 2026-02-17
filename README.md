# Sapient AI Chatbot SDK

The SDK exposes ready-to-use screens and an auth provider for quick integration.

## Installation

```bash
npm install ragnify-ai-chatbot-sdk
```

```bash
yarn add ragnify-ai-chatbot-sdk
```

## Exports

```tsx
import {
  SapientAuthProvider,
  useSapientAuth,
  ChatScreen,
  DashboardScreen,
  LoginScreen,
  RegisterScreen,
} from "ragnify-ai-chatbot-sdk";
```

## Provider usage

```tsx
import { SapientAuthProvider } from "ragnify-ai-chatbot-sdk";

export default function App() {
  return (
    <SapientAuthProvider
      baseUrl="https://api.example.com"
      apiKey="YOUR_KEY"
      organisationMetadata={{
        companyName: "Acme",
        companyMotto: "Knowledge at your fingertips",
        madeBy: "XYZ",
        companyLogo: require("./assets/company_logo.png"),
      }}
    >
      {/* app content */}
    </SapientAuthProvider>
  );
}
```

### Provider props

- `baseUrl: string` — API base URL.
- `apiKey: string` — API key for requests.
- `organisationMetadata?: { companyName?: string; companyMotto?: string; companyLogo?: ImageSourcePropType; madeBy?: string }`
  - `companyName` defaults to `Ragnify`.
  - `companyMotto` defaults to `Knowledge at your fingertips`.
  - `companyLogo` should be an image source (e.g. `require("./assets/company_logo.png")`).
  - `madeBy` defaults to `Sagar Panwar`.

### Asset note

Add `company_logo.png` to your app assets (e.g. `./assets/company_logo.png`) and pass it as `companyLogo`.

## Screen usage

### `LoginScreen`

```tsx
<LoginScreen
  onLoginSuccess={(user) => console.log("Logged in", user)}
  onRegisterLinkPress={() => navigation.navigate("Register")}
  onNavigateToError={() => navigation.navigate("Error")}
/>
```

Props:

- `onLoginSuccess?: (user: any) => void`
- `onRegisterLinkPress?: () => void`
- `onNavigateToError?: () => void`

### `RegisterScreen`

```tsx
<RegisterScreen
  onRegisterSuccess={(user) => console.log("Registered", user)}
  onLoginLinkPress={() => navigation.navigate("Login")}
  onNavigateToError={() => navigation.navigate("Error")}
/>
```

Props:

- `onRegisterSuccess?: (user: any) => void`
- `onLoginLinkPress?: () => void`
- `onNavigateToError?: () => void`

### `ChatScreen`

```tsx
<ChatScreen
  onLogout={() => navigation.replace("Login")}
  onNavigateToDashboard={() => navigation.navigate("Dashboard")}
/>
```

Props:

- `onLogout?: () => void`
- `onNavigateToDashboard?: () => void`

### `DashboardScreen`

```tsx
<DashboardScreen
  onLogout={() => navigation.replace("Login")}
  onNavigateBack={() => navigation.goBack()}
  onNavigateToHome={() => navigation.navigate("Home")}
  onNavigateToError={() => navigation.navigate("Error")}
/>
```

Props:

- `onLogout?: () => void`
- `onNavigateBack?: () => void`
- `onNavigateToHome?: () => void`
- `onNavigateToError?: () => void`
