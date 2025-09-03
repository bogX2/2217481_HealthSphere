// src/components/relationships/DoctorCard.js
import React from 'react';
import ReviewList from '../reviews/ReviewList';
import AddReview from '../reviews/AddReview';

const DoctorCard = ({ doctor, onActionClick, actionLabel, onViewProfile }) => {
  return (
    <div className="card h-100 shadow-sm text-center border-0 option-card">
      <div className="card-body d-flex flex-column">
        {/* Immagine del profilo (placeholder) */}
        <div className="mb-3">
          <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#2a9d8f' }}></i>
        </div>

        <h5 className="card-title fw-bold text-primary">{doctor.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{doctor.specialty}</h6>
        <p className="card-text small text-secondary mt-2">
          {doctor.location || 'Location not specified'}
        </p>

        
        {/* Sezione Recensioni */}
            <div>
                <ReviewList doctorId={doctor.id} />
                <AddReview doctorId={doctor.id} />
            </div>
      

        {/* Pulsante View Profile */}
        <button
          onClick={onViewProfile}
          className="btn btn-outline-primary w-100 mb-2 fw-semibold"
        >
          View Profile
        </button>

        {/* Pulsante principale (es. Collaborazione) */}
        <button
          onClick={onActionClick}
          className="btn btn-success w-100 fw-bold"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
