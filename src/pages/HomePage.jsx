import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/home.css';


export default function HomePage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'kz', label: 'KZ' },
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Nav */}
        <nav className="home-nav">
          <div className="navbar-logo">
            <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#2563EB" opacity="0.12" />
              <path d="M20 6c-3.5 0-6.5 1.8-8.2 4.3C10.5 12.5 9.5 15 9.5 18c0 5.5 3.5 10.5 8.2 12.7.7.3 1.5.5 2.3.5s1.6-.2 2.3-.5C27 28.5 30.5 23.5 30.5 18c0-3-1-5.5-2.3-7.7C26.5 7.8 23.5 6 20 6z" fill="#22C55E" opacity="0.65" />
              <path d="M20 6c0 7-3.5 12-3.5 12s7-1.5 10.5-7" stroke="#22C55E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2.5" fill="#2563EB" />
            </svg>
            <span className="logo-text">NutriMind AI</span>
          </div>

          <div className="home-nav-right">
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
            {user ? (
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                {t('nav.home')}
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => navigate('/login')}>
                  {t('auth.login')}
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>
                  {t('auth.register')}
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="hero-section">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <div className="hero-divider">
            <span className="divider-line"></span>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
            <span className="divider-line"></span>
          </div>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/add-meal' : '/register')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {t('hero.uploadMeal')}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate(user ? '/scan-fridge' : '/register')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <line x1="8" y1="21" x2="8" y2="3" />
                <line x1="16" y1="21" x2="16" y2="3" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
              {t('hero.scanFridge')}
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon feature-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>{t('features.trackProgress')}</h3>
              <p>{t('features.trackProgressDesc')}</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>{t('features.multiLanguage')}</h3>
              <p>{t('features.multiLanguageDesc')}</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9,12 11,14 15,10" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>{t('features.secure')}</h3>
              <p>{t('features.secureDesc')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
