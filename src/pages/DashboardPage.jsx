import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SugarFreeTimer from '../components/SugarFreeTimer';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [latestMeal, setLatestMeal] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [totalSugar, setTotalSugar] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [latestRes, todayRes] = await Promise.all([
        fetch('/api/meals/latest', { headers }),
        fetch('/api/meals', { headers }),
      ]);

      if (latestRes.ok) {
        const latestData = await latestRes.json();
        setLatestMeal(latestData.meal);
      }

      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayMeals(todayData.meals || []);
        setTotalSugar(todayData.totalSugar || 0);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dailyLimit = 30;
  const progressPercent = Math.min((totalSugar / dailyLimit) * 100, 100);

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getRiskBadge(level) {
    const badges = {
      low: { class: 'risk-low', label: '🟢 Low' },
      medium: { class: 'risk-medium', label: '🟡 Medium' },
      high: { class: 'risk-high', label: '🔴 High' },
    };
    return badges[level] || badges.low;
  }

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">{t('hero.title')}</h1>
        <div className="hero-divider">
          <span className="divider-line"></span>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <span className="divider-line"></span>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/add-meal')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t('hero.uploadMeal')}
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/scan-fridge')}>
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

      {/* Main 3-Column Dashboard Grid */}
      <section className="dashboard-grid">
        {/* Left Column: AI Meal Analysis */}
        <div className="card ai-analysis-card">
          <div className="card-header">
            <h2>{t('dashboard.aiAnalysis')}</h2>
            <button className="icon-btn" aria-label="Options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>

          {latestMeal ? (
            <>
              {latestMeal.image_url && (
                <div className="meal-image-container">
                  <img src={latestMeal.image_url} alt={latestMeal.dish_name} className="meal-image" />
                </div>
              )}
              <div className="meal-info">
                <h3 className="dish-name">{latestMeal.dish_name || latestMeal.description}</h3>
                <div className="sugar-estimate">
                  <span className="sugar-label">{t('dashboard.estimatedSugar')}</span>
                  <span className="sugar-value">{latestMeal.sugar_grams}g</span>
                </div>
                <div className="risk-badge-container">
                  <span className={`risk-badge ${getRiskBadge(latestMeal.risk_level).class}`}>
                    {getRiskBadge(latestMeal.risk_level).label}
                  </span>
                </div>
                <p className="approximate-warning">{t('dashboard.approximate')}</p>
                {latestMeal.ingredients && latestMeal.ingredients.length > 0 && (
                  <div className="ingredients">
                    <span className="ingredients-label">{t('dashboard.ingredientsDetected')}</span>
                    <span className="ingredients-list">
                      {Array.isArray(latestMeal.ingredients)
                        ? latestMeal.ingredients.join(', ')
                        : latestMeal.ingredients}
                    </span>
                  </div>
                )}
                <button className="learn-more-link" onClick={() => navigate('/statistics')}>
                  {t('dashboard.learnMore')} →
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <h3>{t('dashboard.noMealYet')}</h3>
              <p>{t('dashboard.uploadFirst')}</p>
            </div>
          )}
        </div>

        {/* Center Column: Today's Sugar Intake */}
        <div className="card today-intake-card">
          <div className="card-header center">
            <h2>{t('dashboard.todaySugarIntake')}</h2>
          </div>

          <div className="total-sugar">
            <span className="total-label">{t('dashboard.totalConsumed')}</span>
            <span className="total-value">{totalSugar.toFixed(1)}g</span>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="progress-label">{t('dashboard.dailyLimit')}</p>
          </div>

          <div className="recent-meals">
            <h3>{t('dashboard.recentMeals')}</h3>
            {todayMeals.length > 0 ? (
              <ul className="meals-list">
                {todayMeals.slice(0, 5).map((meal) => (
                  <li key={meal.id} className="meal-list-item">
                    <div className="meal-thumb">
                      {meal.image_url ? (
                        <img src={meal.image_url} alt="" />
                      ) : (
                        <div className="meal-thumb-placeholder">🍽</div>
                      )}
                    </div>
                    <div className="meal-list-info">
                      <span className="meal-list-name">{meal.dish_name || meal.description}</span>
                      <span className="meal-list-time">{formatTime(meal.created_at)}</span>
                    </div>
                    <span className={`meal-list-sugar ${(meal.sugar_grams || 0) > 15 ? 'high' : ''}`}>
                      {meal.sugar_grams}g
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-meals">{t('dashboard.noMealsToday')}</p>
            )}
          </div>
        </div>

        {/* Right Column: Timer + Recipe */}
        <div className="right-column">
          <SugarFreeTimer />

          <div className="card recipe-card">
            <h2>{t('dashboard.healthyRecipe')}</h2>
            <p className="recipe-desc">{t('dashboard.healthyRecipeDesc')}</p>
            <div className="recipe-illustration">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="14" x2="20" y2="14" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <circle cx="8" cy="5" r="1" fill="#22C55E" />
                <circle cx="16" cy="11" r="1" fill="#22C55E" />
                <circle cx="8" cy="17" r="1" fill="#22C55E" />
              </svg>
            </div>
            <button className="btn btn-green btn-full" onClick={() => navigate('/scan-fridge')}>
              {t('dashboard.uploadFridgePhoto')}
            </button>
          </div>
        </div>
      </section>

      
      {/* Bottom Feature Cards */}
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
  );
}
