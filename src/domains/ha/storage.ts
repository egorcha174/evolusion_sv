// C:/CODE/evolusion/src/domains/ha/storage.ts

/**
 * @fileoverview
 * This file provides a secure wrapper around localStorage.
 * It uses the encryption functions from `crypto.ts` to ensure that any
 * data stored is encrypted before being written to the disk. This is
 * essential for storing sensitive information like API tokens and server URLs.
 *
 * Source of Truth (inspiration): C:\CODE\fusion\utils\secureStorage.ts
 * This module replicates the functionality of providing a simple API
 * (e.g., setItem, getItem) while integrating the new AES-GCM encryption.
 */

import { browser } from '$app/environment';
import { encrypt, decrypt } from './crypto';

/**
 * A shared error message for when localStorage is unavailable.
 */
const LOCAL_STORAGE_UNAVAILABLE = 'localStorage is not available in the current environment.';

/**
 * Stores an item in localStorage after encrypting it.
 * If localStorage is not available (e.g., during SSR), it does nothing.
 *
 * @param {string} key The key to store the item under.
 * @param {string} value The plaintext value to store.
 * @returns {Promise<void>}
 */
export async function setEncryptedItem(key: string, value: string): Promise<void> {
	if (!browser) {
		console.warn(LOCAL_STORAGE_UNAVAILABLE);
		return;
	}

	try {
		const encryptedValue = await encrypt(value);
		localStorage.setItem(key, encryptedValue);
	} catch (error) {
		console.error(`Failed to set encrypted item "${key}":`, error);
	}
}

/**
 * Retrieves and decrypts an item from localStorage.
 * If the item does not exist, is invalid, or if localStorage is unavailable,
 * it returns null.
 *
 * @param {string} key The key of the item to retrieve.
 * @returns {Promise<string | null>} The decrypted value or null.
 */
export async function getDecryptedItem(key: string): Promise<string | null> {
	if (!browser) {
		console.warn(LOCAL_STORAGE_UNAVAILABLE);
		return null;
	}

	try {
		const encryptedValue = localStorage.getItem(key);
		if (encryptedValue === null) {
			return null;
		}

		return await decrypt(encryptedValue);
	} catch (error) {
		console.error(`Failed to get decrypted item "${key}":`, error);
		// If decryption fails, it's safer to remove the corrupted item.
		removeItem(key);
		return null;
	}
}

/**
 * Removes an item from localStorage.
 *
 * @param {string} key The key of the item to remove.
 * @returns {void}
 */
export function removeItem(key: string): void {
	if (!browser) {
		// No need to warn here, as removing a non-existent item is a no-op.
		return;
	}
	localStorage.removeItem(key);
}