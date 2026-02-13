import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/auth.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register(email, password, language);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo" onClick={() => navigate('/')}>
            <svg className="logo-icon" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#2563EB" opacity="0.12" />
              <path d="M20 6c-3.5 0-6.5 1.8-8.2 4.3C10.5 12.5 9.5 15 9.5 18c0 5.5 3.5 10.5 8.2 12.7.7.3 1.5.5 2.3.5s1.6-.2 2.3-.5C27 28.5 30.5 23.5 30.5 18c0-3-1-5.5-2.3-7.7C26.5 7.8 23.5 6 20 6z" fill="#22C55E" opacity="0.65" />
              <circle cx="20" cy="20" r="2.5" fill="#2563EB" />
            </svg>
            <span className="logo-text">NutriMind AI</span>
          </div>
          <h1>{t('auth.registerTitle')}</h1>
          <p className="auth-subtitle">{t('auth.registerSubtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">{t('auth.confirmPassword')}</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? t('auth.registering') : t('auth.register')}
          </button>
        </form>

        <p className="auth-footer">
          {t('auth.hasAccount')}{' '}
          <Link to="/login">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
