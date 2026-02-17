import * as Yup from "yup";

// Password: min 8, at least one number, one letter, one special character
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const registerSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Email must be a valid email"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      passwordRegex,
      "Password must contain at least one letter, one number and one special character",
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Confirm password must match password")
    .required("Confirm password is required"),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Email must be a valid email"),
  password: Yup.string().required("Password is required"),
});
