"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SapientAuthProvider = void 0;
exports.useSapientAuth = useSapientAuth;
var _react = _interopRequireDefault(require("react"));
var _general = require("../utils/general");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const AuthContext = /*#__PURE__*/_react.default.createContext(undefined);
const SapientAuthProvider = ({
  children,
  baseUrl,
  apiKey,
  organisationMetadata
}) => {
  var _user$roles;
  const [user, setUser] = _react.default.useState(null);
  const [accessToken, setAccessToken] = _react.default.useState(null);
  const [refreshToken, setRefreshToken] = _react.default.useState(null);

  // Mirror app logic: isAdmin from user flag, super admin from roles
  // Keep numeric role fallback for backward compatibility.
  const isSuperAdmin = (user === null || user === void 0 || (_user$roles = user.roles) === null || _user$roles === void 0 ? void 0 : _user$roles.includes("super_admin")) ?? Number(user === null || user === void 0 ? void 0 : user.role) === 3;
  const isAdmin = (user === null || user === void 0 ? void 0 : user.isAdmin) ?? (isSuperAdmin || Number(user === null || user === void 0 ? void 0 : user.role) === 2);
  function setTokensInternal(at, rt) {
    setAccessToken(at);
    setRefreshToken(rt);
  }

  /* -------------------------------------------------------------------------- */
  /*                                API Helpers                                 */
  /* -------------------------------------------------------------------------- */
  async function apiRequest(endpoint, options = {}, isMultipart = false) {
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      "x-sdk-api-key": apiKey,
      "x-request-timestamp": Date.now().toString(),
      "x-request-nonce": (0, _general.generateNonce)()
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
      ...(options.headers || {})
    };
    const config = {
      ...options,
      headers: finalHeaders
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
      data = {
        message: text
      };
    }
    if (!response.ok) {
      var _data, _data2;
      const msg = ((_data = data) === null || _data === void 0 ? void 0 : _data.message) || ((_data2 = data) === null || _data2 === void 0 ? void 0 : _data2.error) || `Request failed: ${response.status}`;
      throw new Error(msg);
    }
    return data;
  }

  /* -------------------------------------------------------------------------- */
  /*                                Auth Actions                                */
  /* -------------------------------------------------------------------------- */
  async function login(email, pass) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: pass
      })
    });
  }
  async function register(firstName, lastName, email, pass) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password: pass
      })
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
            "x-api-key": apiKey
          }
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
  function extractUserFromResponse(responseData) {
    var _responseData$data;
    // Customize based on your real API structure used in login.tsx
    // e.g. response.data.user
    const u = (responseData === null || responseData === void 0 || (_responseData$data = responseData.data) === null || _responseData$data === void 0 ? void 0 : _responseData$data.user) || (responseData === null || responseData === void 0 ? void 0 : responseData.user) || (responseData === null || responseData === void 0 ? void 0 : responseData.data);
    if (!u) {
      return {};
    }
    return {
      id: u.id || u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      tenantId: u.tenantId,
      ...u
    };
  }
  return /*#__PURE__*/_react.default.createElement(AuthContext.Provider, {
    value: {
      user,
      setUser,
      isAdmin,
      isSuperAdmin,
      logout,
      accessToken,
      refreshToken,
      setTokens: setTokensInternal,
      config: {
        baseUrl,
        apiKey
      },
      organisationMetadata: {
        companyName: (organisationMetadata === null || organisationMetadata === void 0 ? void 0 : organisationMetadata.companyName) ?? "Ragnify",
        companyMotto: (organisationMetadata === null || organisationMetadata === void 0 ? void 0 : organisationMetadata.companyMotto) ?? "Knowledge at your fingertips",
        companyLogo: organisationMetadata === null || organisationMetadata === void 0 ? void 0 : organisationMetadata.companyLogo,
        madeBy: (organisationMetadata === null || organisationMetadata === void 0 ? void 0 : organisationMetadata.madeBy) ?? "Sagar Panwar"
      },
      login,
      register,
      extractUserFromResponse,
      apiRequest
    }
  }, children);
};
exports.SapientAuthProvider = SapientAuthProvider;
function useSapientAuth() {
  const context = _react.default.useContext(AuthContext);
  if (!context) {
    throw new Error("useSapientAuth must be used within a SapientAuthProvider");
  }
  return context;
}
//# sourceMappingURL=AuthContext.js.map