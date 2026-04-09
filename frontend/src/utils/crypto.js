// Helper to convert buffer to Base64 for transport
const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuffer = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

// 1. Generate a random AES-GCM key
export const generateRoomKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(exported);
};

// 2. Encrypt message
export const encryptMessage = async (text, rawKey) => {
  const key = await window.crypto.subtle.importKey(
    "raw", base64ToBuffer(rawKey), "AES-GCM", true, ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, encoded
  );
  
  return {
    content: bufferToBase64(encrypted),
    iv: bufferToBase64(iv)
  };
};

// 3. Decrypt message
export const decryptMessage = async (encryptedData, ivBase64, rawKey) => {
  const key = await window.crypto.subtle.importKey(
    "raw", base64ToBuffer(rawKey), "AES-GCM", true, ["decrypt"]
  );
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(ivBase64) },
    key,
    base64ToBuffer(encryptedData)
  );
  
  return new TextDecoder().decode(decrypted);
};