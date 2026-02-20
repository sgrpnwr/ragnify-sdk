"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerSchema = exports.loginSchema = void 0;
var Yup = _interopRequireWildcard(require("yup"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Password: min 8, at least one number, one letter, one special character
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const registerSchema = exports.registerSchema = Yup.object({
  firstName: Yup.string().required("First name is required").min(2, "First name must be at least 2 characters long"),
  lastName: Yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters long"),
  email: Yup.string().required("Email is required").email("Email must be a valid email"),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters").matches(passwordRegex, "Password must contain at least one letter, one number and one special character"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Confirm password must match password").required("Confirm password is required")
});
const loginSchema = exports.loginSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Email must be a valid email"),
  password: Yup.string().required("Password is required")
});
//# sourceMappingURL=auth.js.map