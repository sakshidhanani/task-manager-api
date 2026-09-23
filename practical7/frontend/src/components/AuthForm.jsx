import { useState } from 'react';
import { login, register } from '../api.js';

function AuthForm({ onAuthSuccess, pushToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await register(email, password);
        // Register endpoint doesn't return a token (Practical 7 step 3) -
        // log the new user straight in for a smooth flow.
        await login(email, password);
        pushToast('success', 'Account created - welcome!');
      } else {
        await login(email, password);
        pushToast('success', 'Logged in');
      }
      onAuthSuccess();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
          onClick={() => switchMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />

        {formError && <p className="auth-error">{formError}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
