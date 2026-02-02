
// Security constants
const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const KEY_LENGTH = 256;

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to Base64
function bufToBase64(buf: Uint8Array): string {
  let binary = '';
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuf(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  return bufToBase64(salt);
}

export async function deriveKey(pin: string, saltBase64: string): Promise<CryptoKey> {
  const salt = base64ToBuf(saltBase64);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    strToBuf(pin) as any,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // Key is non-extractable!
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = strToBuf(data);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded as any
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bufToBase64(combined);
}

export async function decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToBuf(encryptedBase64);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// Verifier mechanism to check PIN correctness without storing PIN
export async function createVerifier(key: CryptoKey): Promise<string> {
  // Encrypt a known constant
  return encrypt('valid-pin-verifier', key);
}

export async function checkVerifier(verifierBase64: string, key: CryptoKey): Promise<boolean> {
  try {
    const result = await decrypt(verifierBase64, key);
    return result === 'valid-pin-verifier';
  } catch (e) {
    return false;
  }
}
