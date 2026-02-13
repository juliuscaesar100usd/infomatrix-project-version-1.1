import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import '../styles/navbar.css';

export default function Navbar() {
  const { logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'kz', label: 'KZ' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
        <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#2563EB" opacity="0.12" />
          <path d="M20 6c-3.5 0-6.5 1.8-8.2 4.3C10.5 12.5 9.5 15 9.5 18c0 5.5 3.5 10.5 8.2 12.7.7.3 1.5.5 2.3.5s1.6-.2 2.3-.5C27 28.5 30.5 23.5 30.5 18c0-3-1-5.5-2.3-7.7C26.5 7.8 23.5 6 20 6z" fill="#22C55E" opacity="0.65" />
          <path d="M20 6c0 7-3.5 12-3.5 12s7-1.5 10.5-7" stroke="#22C55E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2.5" fill="#2563EB" />
        </svg>
        <span className="logo-text">NutriMind AI</span>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`navbar-center ${menuOpen ? 'show' : ''}`}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
          {t('nav.statistics')}
        </NavLink>
        <NavLink to="/add-meal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
          {t('nav.addMeal')}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
          {t('nav.settings')}
        </NavLink>
      </div>

      <div className={`navbar-right ${menuOpen ? 'show' : ''}`}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
          {t('nav.theme')}
        </button>
        <div className="lang-switcher">
          {languages.map((lang, i) => (
            <span key={lang.code}>
              <button
                className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.label}
              </button>
              {i < languages.length - 1 && <span className="lang-divider">|</span>}
            </span>
          ))}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t('nav.logOut')}
        </button>
        <div className="profile-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </nav>
  );
}