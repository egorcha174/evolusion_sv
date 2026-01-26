// Generate a new key (one time setup)
export async function generateEncryptionKey(): Promise<CryptoKey> {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  return key;
}

// Export key to string for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(exported);
  // Convert to base64
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Import key from string
export async function importKey(keyStr: string): Promise<CryptoKey> {
  const binary = atob(keyStr);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const key = await window.crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

// Encrypt data string
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const encoded = new TextEncoder().encode(data);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Result: IV + Encrypted Data (base64)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  let binary = '';
  const len = combined.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(combined[i]);
  }

  return btoa(binary);
}

// Decrypt data string
export async function decrypt(encryptedStr: string, key: CryptoKey): Promise<string> {
  const binary = atob(encryptedStr);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  return new TextDecoder().decode(decrypted);
}

// Helper to get or create the persistent key
export async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  const keyStr = localStorage.getItem('encryption_key');

  if (keyStr) {
    return importKey(keyStr);
  } else {
    const newKey = await generateEncryptionKey();
    const exported = await exportKey(newKey);
    localStorage.setItem('encryption_key', exported);
    return newKey;
  }
}
