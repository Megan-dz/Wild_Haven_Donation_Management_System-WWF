import React from 'react';
import './ImpactProgressBar.css';

/**
 * ImpactProgressBar Component
 *
 * Displays real-time progress bars showing how donations contribute to specific conservation goals.
 * Shows the amount raised vs. the fundraising target for each conservation campaign.
 *
 * @param {Object} props
 * @param {string} props.campaignName - Name of the conservation campaign
 * @param {number} props.amountRaised - Total amount raised in rupees
 * @param {number} props.targetAmount - Target fundraising goal in rupees
 * @param {string} props.icon - Icon/emoji representing the campaign
 * @param {string} props.description - Brief description of what the funds support
 */
const ImpactProgressBar = ({
  campaignName,
  amountRaised,
  targetAmount,
  icon = '🌿',
  description = ''
}) => {
  const progressPercentage = Math.min((amountRaised / targetAmount) * 100, 100);
  const remainingAmount = Math.max(targetAmount - amountRaised, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="impact-progress-container">
      <div className="progress-header">
        <div className="campaign-title">
          <span className="campaign-icon">{icon}</span>
          <h3>{campaignName}</h3>
        </div>
        <div className="progress-stats">
          <span className="percentage">{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {description && (
        <p className="campaign-description">{description}</p>
      )}

      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`${campaignName} progress`}
          />
        </div>
      </div>

      <div className="progress-details">
        <div className="amount-raised">
          <p className="label">Raised</p>
          <p className="amount">{formatCurrency(amountRaised)}</p>
        </div>
        <div className="target-amount">
          <p className="label">Target</p>
          <p className="amount">{formatCurrency(targetAmount)}</p>
        </div>
        <div className="remaining-amount">
          <p className="label">To Goal</p>
          <p className="amount">{formatCurrency(remainingAmount)}</p>
        </div>
      </div>

      {remainingAmount === 0 && (
        <div className="goal-achieved">
          <span className="checkmark">✓</span> Goal Achieved!
        </div>
      )}
    </div>
  );
};

export default ImpactProgressBar;
