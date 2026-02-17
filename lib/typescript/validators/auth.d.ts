import * as Yup from "yup";
export declare const registerSchema: Yup.ObjectSchema<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, Yup.AnyObject, {
    firstName: undefined;
    lastName: undefined;
    email: undefined;
    password: undefined;
    confirmPassword: undefined;
}, "">;
export declare const loginSchema: Yup.ObjectSchema<{
    email: string;
    password: string;
}, Yup.AnyObject, {
    email: undefined;
    password: undefined;
}, "">;
//# sourceMappingURL=auth.d.ts.map