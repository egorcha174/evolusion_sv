
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { deriveKey, generateSalt, createVerifier, checkVerifier } from '../ha/crypto';

export type SessionState = 'loading' | 'setup' | 'locked' | 'active';

export interface Session {
  state: SessionState;
  key: CryptoKey | null;
  error: string | null;
}

const SALT_KEY = 'auth_salt';
const VERIFIER_KEY = 'auth_verifier';

function createSessionStore() {
  const { subscribe, set, update } = writable<Session>({
    state: 'loading',
    key: null,
    error: null
  });

  return {
    subscribe,
    
    init: async () => {
      if (!browser) return;
      
      const salt = localStorage.getItem(SALT_KEY);
      const verifier = localStorage.getItem(VERIFIER_KEY);

      if (salt && verifier) {
        update(s => ({ ...s, state: 'locked' }));
      } else {
        update(s => ({ ...s, state: 'setup' }));
      }
    },

    unlock: async (pin: string) => {
      update(s => ({ ...s, error: null }));
      
      const salt = localStorage.getItem(SALT_KEY);
      const verifier = localStorage.getItem(VERIFIER_KEY);

      if (!salt || !verifier) {
        // Should happen only if storage cleared while app open
        update(s => ({ ...s, state: 'setup' }));
        return false;
      }

      try {
        const key = await deriveKey(pin, salt);
        const isValid = await checkVerifier(verifier, key);

        if (isValid) {
          update(s => ({ ...s, state: 'active', key }));
          return true;
        } else {
          update(s => ({ ...s, error: 'Invalid PIN' }));
          return false;
        }
      } catch (e) {
        console.error(e);
        update(s => ({ ...s, error: 'Unlock failed' }));
        return false;
      }
    },

    setup: async (pin: string) => {
      try {
        const salt = generateSalt();
        const key = await deriveKey(pin, salt);
        const verifier = await createVerifier(key);

        localStorage.setItem(SALT_KEY, salt);
        localStorage.setItem(VERIFIER_KEY, verifier);

        // Clear potentially invalid old data (security best practice for "nuke and pave")
        // In a real migration scenario, we would re-encrypt here. 
        // For now, we assume fresh start or data loss is acceptable for security upgrade.
        localStorage.removeItem('app_server_config_encrypted');
        
        update(s => ({ ...s, state: 'active', key, error: null }));
        return true;
      } catch (e) {
        console.error(e);
        update(s => ({ ...s, error: 'Setup failed' }));
        return false;
      }
    },
    
    lock: () => {
        update(s => ({ ...s, state: 'locked', key: null }));
    }
  };
}

export const session = createSessionStore();
