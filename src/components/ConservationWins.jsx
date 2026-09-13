import React from 'react';
import './ConservationWins.css';

/**
 * ConservationWins Component
 *
 * Displays recent conservation wins and achievements directly funded by donations.
 * Shows impact metrics and success stories that demonstrate the effectiveness
 * of donor contributions.
 *
 * @param {Object} props
 * @param {Array} props.wins - Array of conservation win objects
 * @param {string} props.wins[].title - Title of the achievement
 * @param {string} props.wins[].description - Detailed description of the win
 * @param {string} props.wins[].category - Category (e.g., 'Habitat', 'Wildlife', 'Anti-Poaching')
 * @param {string} props.wins[].date - Date of the achievement
 * @param {string} props.wins[].icon - Icon/emoji representing the win
 * @param {string} props.wins[].image - URL to image of the win
 * @param {string} props.wins[].metric - Key metric (e.g., '250+ trees planted')
 * @param {string} props.wins[].fundedBy - Amount funded by donations
 */
const ConservationWins = ({ wins = [] }) => {
  if (!wins || wins.length === 0) {
    return (
      <div className="conservation-wins-container">
        <div className="empty-state">
          <p>No conservation wins recorded yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      Habitat: '#27ae60',
      Wildlife: '#3498db',
      'Anti-Poaching': '#e74c3c',
      Community: '#f39c12',
      Technology: '#9b59b6',
      Education: '#1abc9c',
      'Climate Action': '#16a085',
      Research: '#2980b9',
    };
    return colors[category] || '#27ae60';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="conservation-wins-container">
      <div className="wins-header">
        <h2>Recent Conservation Wins</h2>
        <p className="subtitle">
          Real impact from supporter donations. Here's what we've accomplished together.
        </p>
      </div>

      <div className="wins-grid">
        {wins.map((win, index) => (
          <div key={index} className="win-card">
            {/* Image/Visual Section */}
            {win.image && (
              <div className="win-image">
                <img src={win.image} alt={win.title} />
                <div className="category-badge" style={{ backgroundColor: getCategoryColor(win.category) }}>
                  {win.category}
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="win-content">
              <div className="win-header">
                <span className="win-icon">{win.icon}</span>
                <div>
                  <h3 className="win-title">{win.title}</h3>
                  <p className="win-date">📅 {formatDate(win.date)}</p>
                </div>
              </div>

              <p className="win-description">{win.description}</p>

              {/* Metrics Section */}
              {win.metric && (
                <div className="win-metric">
                  <span className="metric-icon">📊</span>
                  <span className="metric-value">{win.metric}</span>
                </div>
              )}

              {/* Funding Info */}
              {win.fundedBy && (
                <div className="funded-by">
                  <p>
                    <strong>Funded by donor support:</strong> {win.fundedBy}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="wins-summary">
        <div className="summary-stat">
          <span className="stat-number">{wins.length}</span>
          <span className="stat-label">Wins Achieved</span>
        </div>
        <div className="summary-stat">
          <span className="stat-icon">🌍</span>
          <span className="stat-label">Making Global Impact</span>
        </div>
        <div className="summary-stat">
          <span className="stat-icon">❤️</span>
          <span className="stat-label">Powered by Donors</span>
        </div>
      </div>
    </div>
  );
};

export default ConservationWins;
