// Helper to generate a random nonce
export function generateNonce(length = 24) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export const handleErrors = async response => {
  if (response.status === 401) {
    throw Error("Unauthorized. Please try again later.");
  }
  if (response.status === 403) {
    throw Error("Forbidden. You don't have permission to access this resource.");
  }
  if (response.status >= 500) {
    throw Error("Server error. Please try again later.");
  }
  if (response.status === 429) {
    throw new Error("Too many requests. Please try again later.");
  }
  throw new Error("Something went wrong. Please try again later.");
};
//# sourceMappingURL=general.js.map