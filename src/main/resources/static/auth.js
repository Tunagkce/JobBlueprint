const loginTab = document.querySelector('#login-tab');
const registerTab = document.querySelector('#register-tab');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const message = document.querySelector('#auth-message');

function selectMode(mode) {
  const registering = mode === 'register';
  loginForm.hidden = registering;
  registerForm.hidden = !registering;
  loginTab.classList.toggle('active', !registering);
  registerTab.classList.toggle('active', registering);
  loginTab.setAttribute('aria-selected', String(!registering));
  registerTab.setAttribute('aria-selected', String(registering));
  document.querySelector('#auth-title').textContent = registering ? 'Create your account.' : 'Welcome back.';
}

loginTab.addEventListener('click', () => selectMode('login'));
registerTab.addEventListener('click', () => selectMode('register'));

const errors = {
  login: 'Those sign-in details were not recognized. Try again.',
  email: 'Enter a valid email address.',
  password: 'Choose a password between 12 and 72 characters.',
  match: 'The passwords do not match.',
  exists: 'An account already uses that email. Sign in instead.',
};
const query = new URLSearchParams(window.location.search);
if (query.has('error')) {
  message.textContent = errors[query.get('error')] || 'Sign-in could not be completed. Please try again.';
  message.classList.add('error');
  if (query.get('error') !== 'login') selectMode('register');
} else if (query.has('logout')) {
  message.textContent = 'You have signed out.';
}
selectMode(query.get('error') && query.get('error') !== 'login' ? 'register' : 'login');

async function initializeAuth() {
  try {
    const [csrfResponse, providersResponse] = await Promise.all([
      fetch('/api/auth/csrf'),
      fetch('/api/auth/providers'),
    ]);
    if (csrfResponse.ok) {
      const csrf = await csrfResponse.json();
      document.querySelectorAll('.csrf-field').forEach((field) => {
        field.name = csrf.parameterName;
        field.value = csrf.token;
      });
    }
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      for (const [name, enabled] of Object.entries(providers)) {
        const button = document.querySelector(`[data-provider="${name}"]`);
        if (button) {
          button.disabled = !enabled;
          button.setAttribute('aria-label', enabled
            ? `Continue with ${button.dataset.label}`
            : `${button.dataset.label} sign-in is not configured`);
          if (enabled) {
            button.addEventListener('click', () => {
              window.location.assign(`/oauth2/authorization/${name}`);
            });
          }
        }
      }
      const unavailable = Object.entries(providers)
        .filter(([, enabled]) => !enabled)
        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
      const providerNote = document.querySelector('#provider-note');
      providerNote.hidden = unavailable.length === 0;
      if (unavailable.length) {
        providerNote.textContent = `${unavailable.join(', ')} sign-in ${unavailable.length === 1 ? 'is' : 'are'} disabled until provider credentials are configured.`;
      }
    }
  } catch {
    message.textContent = 'Could not load sign-in options. Refresh the page to try again.';
    message.classList.add('error');
  }
}

initializeAuth();
