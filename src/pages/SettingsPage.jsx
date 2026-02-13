import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/settings.css';

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [saved, setSaved] = useState(false);

  async function handleLanguageChange(lang) {
    setLanguage(lang);
    setSaved(false);

    try {
      const res = await fetch('/api/user/language', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save language error:', err);
    }
  }

  const languages = [
    { code: 'en', label: t('settings.english'), flag: '🇺🇸' },
    { code: 'ru', label: t('settings.russian'), flag: '🇷🇺' },
    { code: 'kz', label: t('settings.kazakh'), flag: '🇰🇿' },
  ];

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      {saved && (
        <div className="success-banner">
          ✓ {t('settings.saved')}
        </div>
      )}

      {/* Language Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          <div>
            <h2>{t('settings.language')}</h2>
            <p>{t('settings.languageDesc')}</p>
          </div>
        </div>
        <div className="language-options">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.label}</span>
              {language === lang.code && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="settings-card">
        <div className="settings-card-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div>
            <h2>{t('settings.account')}</h2>
          </div>
        </div>
        <div className="account-info">
          <div className="account-row">
            <span className="account-label">{t('settings.email')}</span>
            <span className="account-value">{user?.email}</span>
          </div>
          <div className="account-row">
            <span className="account-label">{t('settings.memberSince')}</span>
            <span className="account-value">{formatDate(user?.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
