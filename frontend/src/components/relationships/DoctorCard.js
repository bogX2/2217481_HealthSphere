// src/components/relationships/DoctorCard.js
import React from 'react';

const DoctorCard = ({ doctor, onActionClick, actionLabel = "Request Collaboration" }) => {
  return (
    <div className="doctor-card card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="card-body p-4 d-flex flex-column">
        <div className="text-center mb-3">
          <h3 className="card-title mb-2 fw-bold" style={{ fontSize: "1.5rem" }}>
            {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-primary mb-0" style={{ fontSize: "1.1rem" }}>
            {doctor.specialty}
          </p>
        </div>
        
        <div className="mt-auto">
          <button 
            className="btn btn-primary w-100 py-2 fw-medium rounded-2"
            style={{ fontSize: "1.05rem", padding: "0.6rem 0" }}
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;