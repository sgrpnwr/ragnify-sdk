import React from "react";
type Props = {
    baseUrl?: string;
    isAdmin?: boolean;
    accessToken: string;
    tenantId?: string;
    onNavigateToError?: () => void;
};
export default function ChatPanel({ baseUrl, accessToken, tenantId, onNavigateToError, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=ChatPanel.d.ts.map