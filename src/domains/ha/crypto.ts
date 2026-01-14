// C:/CODE/evolusion/src/domains/ha/crypto.ts

/**
 * @fileoverview
 * This file implements encryption and decryption using the Web Crypto API with AES-GCM.
 * It is designed to securely store sensitive data, such as API tokens, in localStorage.
 *
 * Source of Truth (inspiration): C:\CODE\fusion\utils\secureStorage.ts
 * The original file used a different encryption library, but the principle of encrypting
 * data before storing it in localStorage is the same. This implementation uses the
 * modern Web Crypto API as required.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits, recommended for AES-GCM

// --- Helper functions for Base64 conversion ---

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer The buffer to convert.
 * @returns {string} The Base64-encoded string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 The Base64-encoded string.
 * @returns {ArrayBuffer} The decoded ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary_string = atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}


/**
 * Derives a CryptoKey from a password or a stored key.
 *
 * IMPORTANT: This is a placeholder implementation. In a real-world scenario, the key
 * should be derived from a user-provided password using a key derivation function
 * like PBKDF2, or managed in a more secure way. For this migration, we will
 * use a fixed, non-exported key for demonstration purposes, acknowledging the
 * security constraints mentioned in GEMINI.md.
 *
 * @returns {Promise<CryptoKey>} A promise that resolves to a CryptoKey.
 */
async function getKey(): Promise<CryptoKey> {
	// TODO: Replace this with a robust key management strategy.
	// This key is for demonstration purposes ONLY and is NOT secure.
	const secret = 'this-is-not-a-secure-secret-key!';
	const keyData = new TextEncoder().encode(secret);
	const keyHash = await crypto.subtle.digest('SHA-256', keyData);

	return crypto.subtle.importKey(
		'raw',
		keyHash,
		{ name: ALGORITHM },
		false, // not extractable
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypts a plaintext string.
 * @param {string} plaintext The string to encrypt.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the encrypted data and the initialization vector (IV), base64-encoded.
 * @throws {Error} If encryption fails.
 */
export async function encrypt(plaintext: string): Promise<string> {
	const key = await getKey();
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const encodedPlaintext = new TextEncoder().encode(plaintext);

	const ciphertext = await crypto.subtle.encrypt(
		{
			name: ALGORITHM,
			iv: iv
		},
		key,
		encodedPlaintext
	);

	const encryptedPayload = {
		iv: arrayBufferToBase64(iv.buffer),
		data: arrayBufferToBase64(ciphertext)
	};

	return JSON.stringify(encryptedPayload);
}

/**
 * Decrypts a string that was encrypted with the `encrypt` function.
 * @param {string} jsonPayload The JSON string payload from the encrypt function.
 * @returns {Promise<string>} A promise that resolves to the decrypted plaintext.
 * @throws {Error} If the payload is invalid or decryption fails.
 */
export async function decrypt(jsonPayload: string): Promise<string> {
	const key = await getKey();
	let encryptedPayload: { iv: string; data: string };

	try {
		encryptedPayload = JSON.parse(jsonPayload);
	} catch (error) {
		throw new Error('Invalid encrypted payload format.');
	}

	const { iv, data } = encryptedPayload;
	if (!iv || !data) {
		throw new Error('Invalid encrypted payload structure.');
	}

	const ivBuffer = base64ToArrayBuffer(iv);
	const dataBuffer = base64ToArrayBuffer(data);

	try {
		const decrypted = await crypto.subtle.decrypt(
			{
				name: ALGORITHM,
				iv: ivBuffer
			},
			key,
			dataBuffer
		);

		return new TextDecoder().decode(decrypted);
	} catch (error) {
		console.error('Decryption failed:', error);
		throw new Error('Unable to decrypt data. The data may be corrupt or the key may be incorrect.');
	}
}