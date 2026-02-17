import React from "react";
import type { ImageSourcePropType } from "react-native";

export type SapientUser = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number | string;
  roles?: string[];
  isAdmin?: boolean;
  tenantId?: string;
  [key: string]: any;
};

type SapientConfig = {
  baseUrl: string;
  apiKey: string;
  // any other config
};

export type OrganisationMetadata = {
  companyName?: string;
  companyMotto?: string;
  companyLogo?: ImageSourcePropType;
  madeBy?: string;
};

type AuthContextType = {
  user: SapientUser | null;
  setUser: (user: SapientUser | null) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  config: SapientConfig;
  organisationMetadata: OrganisationMetadata;

  // Methods used by screens
  login: (email: string, pass: string) => Promise<any>;
  register: (
    first: string,
    last: string,
    email: string,
    pass: string,
  ) => Promise<any>;
  extractUserFromResponse: (data: any) => SapientUser;
  apiRequest: (
    endpoint: string,
    options?: RequestInit,
    isMultipart?: boolean,
  ) => Promise<any>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const SapientAuthProvider = ({
  children,
  baseUrl,
  apiKey,
  organisationMetadata,
}: {
  children: React.ReactNode;
  baseUrl: string;
  apiKey: string;
  organisationMetadata?: OrganisationMetadata;
}) => {
  const [user, setUser] = React.useState<SapientUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);

  // Mirror app logic: isAdmin from user flag, super admin from roles
  // Keep numeric role fallback for backward compatibility.
  const isSuperAdmin =
    user?.roles?.includes("super_admin") ?? Number(user?.role) === 3;
  const isAdmin = user?.isAdmin ?? (isSuperAdmin || Number(user?.role) === 2);

  function setTokensInternal(at: string | null, rt: string | null) {
    setAccessToken(at);
    setRefreshToken(rt);
  }

  /* -------------------------------------------------------------------------- */
  /*                                API Helpers                                 */
  /* -------------------------------------------------------------------------- */
  async function apiRequest(
    endpoint: string,
    options: RequestInit = {},
    isMultipart = false,
  ) {
    const url = `${baseUrl}${endpoint}`;

    const headers: any = {
      "x-api-key": apiKey,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    // Merge custom headers
    const finalHeaders = {
      ...headers,
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers: finalHeaders,
    };

    console.log(`[SDK] Requesting: ${url}`, config.method || "GET");

    const response = await fetch(url, config);
    const text = await response.text();

    let data;
    try {
      if (text) {
        data = JSON.parse(text);
      } else {
        data = {};
      }
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const msg =
        data?.message || data?.error || `Request failed: ${response.status}`;
      throw new Error(msg);
    }
    return data;
  }

  /* -------------------------------------------------------------------------- */
  /*                                Auth Actions                                */
  /* -------------------------------------------------------------------------- */
  async function login(email: string, pass: string) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    });
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    pass: string,
  ) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password: pass }),
    });
  }

  async function logout() {
    // Attempt graceful logout on server
    try {
      if (accessToken) {
        // Just fire and forget or await
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-api-key": apiKey,
          },
        });
      }
    } catch (error) {
      console.warn("Logout error", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  }

  function extractUserFromResponse(responseData: any): SapientUser {
    // Customize based on your real API structure used in login.tsx
    // e.g. response.data.user
    const u =
      responseData?.data?.user || responseData?.user || responseData?.data;

    if (!u) {
      return {} as SapientUser;
    }

    return {
      id: u.id || u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      tenantId: u.tenantId,
      ...u,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        isSuperAdmin,
        logout,
        accessToken,
        refreshToken,
        setTokens: setTokensInternal,
        config: { baseUrl, apiKey },
        organisationMetadata: {
          companyName: organisationMetadata?.companyName ?? "Ragnify",
          companyMotto:
            organisationMetadata?.companyMotto ??
            "Knowledge at your fingertips",
          companyLogo: organisationMetadata?.companyLogo,
          madeBy: organisationMetadata?.madeBy ?? "Sagar Panwar",
        },
        login,
        register,
        extractUserFromResponse,
        apiRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useSapientAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useSapientAuth must be used within a SapientAuthProvider");
  }
  return context;
}
