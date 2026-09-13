import React, { useState } from 'react';
import './DonorTestimonials.css';

/**
 * DonorTestimonials Component
 * 
 * Displays stories and testimonials from donors explaining their motivations
 * for supporting wildlife conservation through Wild Haven.
 * 
 * @param {Object} props
 * @param {Array} props.testimonials - Array of testimonial objects
 * @param {string} props.testimonials[].name - Donor's name
 * @param {string} props.testimonials[].location - Donor's location/city
 * @param {string} props.testimonials[].story - Donor's testimonial text
 * @param {string} props.testimonials[].cause - Conservation cause they support
 * @param {number} props.testimonials[].donationAmount - Amount donated
 * @param {string} props.testimonials[].avatar - URL to donor's avatar or initials
 */
const DonorTestimonials = ({ testimonials = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="donor-testimonials-container">
        <div className="empty-state">
          <p>No testimonials available yet. Be the first to share your story!</p>
        </div>
      </div>
    );
  }

  const currentTestimonial = testimonials[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="donor-testimonials-container">
      <div className="testimonials-header">
        <h2>Donor Stories</h2>
        <p className="subtitle">
          Hear from supporters like you about why conservation matters
        </p>
      </div>

      <div className="testimonials-content">
        <div className="testimonial-card">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar">
              {currentTestimonial.avatar ? (
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                />
              ) : (
                <div className="avatar-initials">
                  {currentTestimonial.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              )}
            </div>
            <div className="donor-info">
              <h3>{currentTestimonial.name}</h3>
              <p className="location">📍 {currentTestimonial.location}</p>
              <div className="cause-badge">{currentTestimonial.cause}</div>
            </div>
          </div>

          {/* Story Section */}
          <div className="story-section">
            <svg
              className="quote-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5m14 0c-1.25 0-4.716 3.75-4.716 5v8c0 7 4 8 7 8z" />
            </svg>
            <p className="testimonial-text">"{currentTestimonial.story}"</p>
          </div>

          {/* Donation Amount */}
          <div className="donation-info">
            <span className="label">Supported with</span>
            <span className="amount">{formatCurrency(currentTestimonial.donationAmount)}</span>
          </div>
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="testimonials-navigation">
            <button
              onClick={handlePrevious}
              className="nav-button prev"
              aria-label="Previous testimonial"
            >
              ‹
            </button>

            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`indicator ${index === selectedIndex ? 'active' : ''}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === selectedIndex}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="nav-button next"
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Mini Grid View (Mobile-Friendly Summary) */}
      {testimonials.length > 1 && (
        <div className="testimonials-summary">
          <p className="summary-text">
            {selectedIndex + 1} of {testimonials.length} supporters
          </p>
        </div>
      )}
    </div>
  );
};

export default DonorTestimonials;
