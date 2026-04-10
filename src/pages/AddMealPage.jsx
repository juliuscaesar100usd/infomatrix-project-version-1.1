import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/addmeal.css';

export default function AddMealPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
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

    if (!image && !description.trim()) {
      setError('Please provide an image or description');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      if (description.trim()) formData.append('description', description.trim());

      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getRiskLabel(level) {
    const map = {
      low: t('addMeal.riskLow'),
      medium: t('addMeal.riskMedium'),
      high: t('addMeal.riskHigh'),
    };
    return map[level] || map.low;
  }

  function handleReset() {
    setImage(null);
    setImagePreview(null);
    setDescription('');
    setResult(null);
    setError('');
  }

  return (
    <div className="add-meal-page">
      <div className="page-header">
        <h1>{t('addMeal.title')}</h1>
        <p>{t('addMeal.subtitle')}</p>
      </div>

      {!result ? (
        <form className="meal-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          {/* Image Upload */}
          <div className="form-group">
            <label>{t('addMeal.imageLabel')}</label>
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''} ${imagePreview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    {t('addMeal.changeImage')}
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                  <p>{t('addMeal.dragDrop')}</p>
                  <span className="formats">{t('addMeal.supportedFormats')}</span>
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

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">{t('addMeal.descriptionLabel')}</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('addMeal.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <strong>{t('addMeal.disclaimerTitle')}</strong>
              <p>{t('addMeal.disclaimer')}</p>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                {t('addMeal.analyzing')}
              </span>
            ) : (
              t('addMeal.analyzeBtn')
            )}
          </button>
        </form>
      ) : (
        <div className="analysis-result">
          <div className="result-header">
            <h2>{t('addMeal.results')}</h2>
            <div className="result-success">✓ {t('addMeal.savedSuccess')}</div>
          </div>

          <div className="result-card">
            {imagePreview && (
              <img src={imagePreview} alt={result.analysis?.dishName} className="result-image" />
            )}

            <div className="result-details">
              <div className="result-row">
                <span className="result-label">{t('addMeal.dishName')}</span>
                <span className="result-value">{result.analysis?.dishName || result.meal?.dish_name}</span>
              </div>

              <div className="result-row">
                <span className="result-label">{t('addMeal.sugar')}</span>
                <span className="result-value sugar-value">{result.analysis?.sugarGrams || result.meal?.sugar_grams}g</span>
              </div>

              <div className="result-row">
                <span className="result-label">{t('addMeal.riskLevel')}</span>
                <span className={`result-value risk-badge risk-${result.analysis?.riskLevel || result.meal?.risk_level}`}>
                  {getRiskLabel(result.analysis?.riskLevel || result.meal?.risk_level)}
                </span>
              </div>

              {result.analysis?.ingredients && result.analysis.ingredients.length > 0 && (
                <div className="result-row">
                  <span className="result-label">{t('addMeal.ingredients')}</span>
                  <span className="result-value">{result.analysis.ingredients.join(', ')}</span>
                </div>
              )}
            </div>

            <p className="approximate-warning">{t('dashboard.approximate')}</p>

            
            {result.analysis?.warning && (
              <p className="ai-warning">ℹ {result.analysis.warning}</p>
            )}
          </div>

          <div className="result-actions">
            <button className="btn btn-primary" onClick={handleReset}>
              {t('addMeal.addAnother')}
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/statistics')}>
              {t('addMeal.viewStats')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
