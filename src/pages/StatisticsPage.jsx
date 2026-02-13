import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/statistics.css';

export default function StatisticsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [totalSugar, setTotalSugar] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
        setTotalSugar(data.totalSugar || 0);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [date, token]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  async function handleDelete(mealId) {
    if (!window.confirm(t('statistics.confirmDelete'))) return;

    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchMeals();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const avgPerMeal = meals.length > 0 ? (totalSugar / meals.length).toFixed(1) : 0;

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>{t('statistics.title')}</h1>
        <p>{t('statistics.subtitle')}</p>
      </div>

      {/* Date Picker */}
      <div className="date-picker-container">
        <label htmlFor="stat-date">{t('statistics.dateLabel')}</label>
        <input
          id="stat-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="date-input"
        />
        {!isToday && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
          >
            {t('statistics.today')}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <div>
            <span className="stat-value">{totalSugar.toFixed(1)}{t('statistics.grams')}</span>
            <span className="stat-label">{t('statistics.totalSugar')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <div>
            <span className="stat-value">{meals.length}</span>
            <span className="stat-label">{t('statistics.mealsLogged')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <div>
            <span className="stat-value">{avgPerMeal}{t('statistics.grams')}</span>
            <span className="stat-label">{t('statistics.avgPerMeal')}</span>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="meals-table-container">
        <h2>{t('statistics.mealsList')}</h2>
        {loading ? (
          <div className="page-loader">{t('common.loading')}</div>
        ) : meals.length > 0 ? (
          <div className="meals-table">
            {meals.map((meal) => (
              <div key={meal.id} className="meal-row">
                <div className="meal-row-image">
                  {meal.image_url ? (
                    <img src={meal.image_url} alt={meal.dish_name} />
                  ) : (
                    <div className="meal-row-placeholder">🍽</div>
                  )}
                </div>
                <div className="meal-row-info">
                  <span className="meal-row-name">{meal.dish_name || meal.description}</span>
                  <span className="meal-row-time">{formatDateTime(meal.created_at)}</span>
                </div>
                <div className="meal-row-sugar">
                  <span className={`sugar-badge ${(meal.sugar_grams || 0) > 15 ? 'high' : (meal.sugar_grams || 0) > 5 ? 'medium' : 'low'}`}>
                    {meal.sugar_grams}{t('statistics.grams')}
                  </span>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(meal.id)}
                >
                  {t('statistics.deleteMeal')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            <p>{t('statistics.noMeals')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
