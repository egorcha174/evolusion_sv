
<script lang="ts">
  import { session } from '../../app/session';
  import 'iconify-icon';

  let pin = $state('');
  let isLoading = $state(false);
  let errorShake = $state(false);

  let mode = $derived($session.state === 'setup' ? 'create' : 'unlock');
  let error = $derived($session.error);

  async function handleSubmit() {
    if (pin.length < 4) return;
    
    isLoading = true;
    let success = false;

    // Small delay to prevent brute force speed (and show UI feedback)
    await new Promise(r => setTimeout(r, 300));

    if (mode === 'create') {
      success = await session.setup(pin);
    } else {
      success = await session.unlock(pin);
    }

    isLoading = false;
    
    if (!success) {
      errorShake = true;
      setTimeout(() => errorShake = false, 500);
      pin = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<div class="pin-screen">
  <div class="card" class:shake={errorShake}>
    <div class="icon-wrapper">
      <iconify-icon icon="mdi:shield-lock" width="48"></iconify-icon>
    </div>
    
    <h2>{mode === 'create' ? 'Create PIN' : 'Welcome Back'}</h2>
    <p class="subtitle">
      {mode === 'create' 
        ? 'Set a secure PIN to encrypt your data.' 
        : 'Enter your PIN to unlock Evolusion.'}
    </p>

    <div class="input-wrapper">
      <input 
        type="password" 
        inputmode="numeric" 
        pattern="[0-9]*" 
        bind:value={pin} 
        placeholder="Enter PIN"
        onkeydown={handleKeydown}
        disabled={isLoading}
        autofocus
      />
    </div>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}

    <button class="btn-unlock" onclick={handleSubmit} disabled={isLoading || pin.length < 4}>
      {isLoading ? 'Processing...' : (mode === 'create' ? 'Set PIN' : 'Unlock')}
    </button>
  </div>
</div>

<style>
  .pin-screen {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: var(--bg-page, #f0f2f5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .card {
    background: var(--bg-panel, #ffffff);
    padding: 2.5rem;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 360px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid var(--border-primary, rgba(0,0,0,0.05));
  }

  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }

  .icon-wrapper {
    color: var(--accent-primary, #2196f3);
    margin-bottom: 1.5rem;
    background: rgba(33, 150, 243, 0.1);
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  h2 { margin: 0 0 0.5rem 0; color: var(--text-primary, #333); font-size: 1.5rem; }
  .subtitle { margin: 0 0 2rem 0; color: var(--text-secondary, #666); font-size: 0.9rem; }

  .input-wrapper { width: 100%; margin-bottom: 1rem; }
  
  input {
    width: 100%;
    padding: 1rem;
    font-size: 1.5rem;
    text-align: center;
    border: 2px solid var(--border-input, #ddd);
    border-radius: 12px;
    background: var(--bg-input, #f9f9f9);
    color: var(--text-primary, #333);
    letter-spacing: 0.5rem;
    outline: none;
    transition: border-color 0.2s;
  }
  
  input:focus {
    border-color: var(--accent-primary, #2196f3);
    background: var(--bg-panel, #fff);
  }

  .error-msg {
    color: #f44336;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .btn-unlock {
    width: 100%;
    padding: 1rem;
    background: var(--accent-primary, #2196f3);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .btn-unlock:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
</style>
