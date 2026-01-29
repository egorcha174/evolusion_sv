
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { deriveKey, generateSalt, createVerifier, checkVerifier } from '../ha/crypto';

export type SessionState = 'loading' | 'setup' | 'locked' | 'active';

export interface Session {
  state: SessionState;
  key: CryptoKey | null;
  error: string | null;
  isAutoLogin: boolean;
}

const SALT_KEY = 'auth_salt';
const VERIFIER_KEY = 'auth_verifier';
const AUTO_LOGIN_KEY = 'auth_auto_pin';

function createSessionStore() {
  const { subscribe, set, update } = writable<Session>({
    state: 'loading',
    key: null,
    error: null,
    isAutoLogin: false
  });

  return {
    subscribe,
    
    init: async () => {
      if (!browser) {
        // On server, we can't be locked, so default to setup
        update(s => ({ ...s, state: 'setup' }));
        return;
      }
      
      try {
        const salt = localStorage.getItem(SALT_KEY);
        const verifier = localStorage.getItem(VERIFIER_KEY);
        const autoPin = localStorage.getItem(AUTO_LOGIN_KEY);

        if (salt && verifier) {
          if (autoPin) {
            try {
              const pin = atob(autoPin);
              const key = await deriveKey(pin, salt);
              const isValid = await checkVerifier(verifier, key);
              
              if (isValid) {
                update(s => ({ ...s, state: 'active', key, isAutoLogin: true }));
                return; // Exit early on success
              } else {
                console.warn('Auto-login PIN invalid, removing.');
                localStorage.removeItem(AUTO_LOGIN_KEY);
              }
            } catch (e) {
              console.error('Auto-login failed', e);
              localStorage.removeItem(AUTO_LOGIN_KEY);
            }
          }
          
          const hasAutoPin = !!localStorage.getItem(AUTO_LOGIN_KEY);
          update(s => ({ ...s, state: 'locked', isAutoLogin: hasAutoPin }));
        } else {
          update(s => ({ ...s, state: 'setup', isAutoLogin: false }));
        }
      } catch (error) {
        console.error("Critical error during session init:", error);
        update(s => ({ ...s, state: 'setup', error: 'Initialization failed' }));
      }
    },

    verifyPin: async (pin: string): Promise<boolean> => {
      if (!browser) return false;
      
      const salt = localStorage.getItem(SALT_KEY);
      const verifier = localStorage.getItem(VERIFIER_KEY);

      if (!salt || !verifier) return false;

      try {
        const key = await deriveKey(pin, salt);
        return await checkVerifier(verifier, key);
      } catch (e) {
        console.error('Verify PIN failed', e);
        return false;
      }
    },

    unlock: async (pin: string) => {
      update(s => ({ ...s, error: null }));
      
      const salt = localStorage.getItem(SALT_KEY);
      const verifier = localStorage.getItem(VERIFIER_KEY);

      if (!salt || !verifier) {
        update(s => ({ ...s, state: 'setup' }));
        return false;
      }

      try {
        const key = await deriveKey(pin, salt);
        const isValid = await checkVerifier(verifier, key);

        if (isValid) {
          // Sync auto-login state from storage to be sure
          const isAuto = !!localStorage.getItem(AUTO_LOGIN_KEY);
          update(s => ({ ...s, state: 'active', key, isAutoLogin: isAuto }));
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
        localStorage.removeItem(AUTO_LOGIN_KEY); // Clear any old auto-login

        localStorage.removeItem('app_server_config_encrypted');
        
        update(s => ({ ...s, state: 'active', key, error: null, isAutoLogin: false }));
        return true;
      } catch (e) {
        console.error(e);
        update(s => ({ ...s, error: 'Setup failed' }));
        return false;
      }
    },

    changePin: async (newPin: string): Promise<boolean> => {
      try {
        const salt = generateSalt();
        const key = await deriveKey(newPin, salt);
        const verifier = await createVerifier(key);

        localStorage.setItem(SALT_KEY, salt);
        localStorage.setItem(VERIFIER_KEY, verifier);
        
        // If auto-login was enabled, update the stored PIN
        if (localStorage.getItem(AUTO_LOGIN_KEY)) {
           localStorage.setItem(AUTO_LOGIN_KEY, btoa(newPin));
        }
        
        update(s => ({ ...s, key, error: null }));
        return true;
      } catch (e) {
        console.error(e);
        update(s => ({ ...s, error: 'Change PIN failed' }));
        return false;
      }
    },
    
    lock: () => {
        update(s => ({ ...s, state: 'locked', key: null }));
    },

    enableAutoLogin: (pin: string) => {
        if (!browser) return;
        // Simple obfuscation (Base64) just to not store plain text visually
        localStorage.setItem(AUTO_LOGIN_KEY, btoa(pin));
        update(s => ({ ...s, isAutoLogin: true }));
    },

    disableAutoLogin: () => {
        if (!browser) return;
        localStorage.removeItem(AUTO_LOGIN_KEY);
        update(s => ({ ...s, isAutoLogin: false }));
    }
  };
}

export const session = createSessionStore();
