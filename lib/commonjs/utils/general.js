"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateNonce = generateNonce;
// Helper to generate a random nonce
function generateNonce(length = 24) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
//# sourceMappingURL=general.js.map