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
    login: (email: string, pass: string) => Promise<any>;
    register: (first: string, last: string, email: string, pass: string) => Promise<any>;
    extractUserFromResponse: (data: any) => SapientUser;
    apiRequest: (endpoint: string, options?: RequestInit, isMultipart?: boolean) => Promise<any>;
};
export declare const SapientAuthProvider: ({ children, baseUrl, apiKey, organisationMetadata, }: {
    children: React.ReactNode;
    baseUrl: string;
    apiKey: string;
    organisationMetadata?: OrganisationMetadata;
}) => React.JSX.Element;
export declare function useSapientAuth(): AuthContextType;
export {};
//# sourceMappingURL=AuthContext.d.ts.map