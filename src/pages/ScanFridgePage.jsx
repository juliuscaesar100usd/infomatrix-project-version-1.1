import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/fridge.css';

export default function ScanFridgePage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleImageChange(file) {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!image) {
      setError(t('fridge.noImageError'));
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await fetch('/api/fridge/scan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  }

  return (
    <div className="fridge-page">
      <div className="page-header">
        <h1>{t('fridge.title')}</h1>
        <p>{t('fridge.subtitle')}</p>
      </div>

      {!result ? (
        <form className="fridge-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>{t('fridge.imageLabel')}</label>
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''} ${imagePreview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Fridge preview" className="image-preview" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    {t('fridge.changePhoto')}
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="4" y1="10" x2="20" y2="10" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <circle cx="8" cy="6" r="1" fill="#94A3B8" />
                    <circle cx="16" cy="14" r="1" fill="#94A3B8" />
                  </svg>
                  <p>{t('fridge.dragDrop')}</p>
                  <span className="formats">{t('fridge.supportedFormats')}</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden-input"
                onChange={(e) => handleImageChange(e.target.files[0])}
              />
            </div>
          </div>

          <div className="fridge-tip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>{t('fridge.tip')}</p>
          </div>

          <button type="submit" className="btn btn-green btn-lg btn-full" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner spinner-green"></span>
                {t('fridge.scanning')}
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                  <polyline points="17,6 23,6 23,12" />
                </svg>
                {t('fridge.scanBtn')}
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="fridge-results">
          {/* Detected Ingredients */}
          <div className="ingredients-card">
            <h2>{t('fridge.detectedIngredients')}</h2>
            <div className="ingredient-tags">
              {result.ingredients.map((item, i) => (
                <span key={i} className="ingredient-tag">{item}</span>
              ))}
            </div>
            {result.warning && (
              <p className="fridge-warning">⚠ {result.warning}</p>
            )}
          </div>

          {/* Recipe Cards */}
          <div className="recipes-section">
            <h2>{t('fridge.recipesForYou')}</h2>
            <p className="recipes-subtitle">{t('fridge.recipesSubtitle')}</p>

            {result.recipes.length > 0 ? (
              <div className="recipe-cards-grid">
                {result.recipes.map((recipe, i) => (
                  <a
                    key={i}
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recipe-result-card"
                  >
                    <div className="recipe-card-number">{i + 1}</div>
                    <div className="recipe-card-body">
                      <h3 className="recipe-card-title">{recipe.title}</h3>
                      <p className="recipe-card-desc">{recipe.description}</p>
                      <div className="recipe-card-footer">
                        <span className="recipe-source">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                          </svg>
                          {recipe.source}
                        </span>
                        <span className="view-recipe-link">
                          {t('fridge.viewRecipe')} →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('fridge.noRecipes')}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="fridge-result-actions">
            <button className="btn btn-green" onClick={handleReset}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {t('fridge.scanAnother')}
            </button>
            <button className="btn btn-outline" onClick={() => window.history.back()}>
              {t('common.back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
