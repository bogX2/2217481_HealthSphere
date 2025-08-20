import React from 'react';

const DoctorCard = ({ doctor, onActionClick, actionLabel = "Request Collaboration" }) => {
  // Use the name field we're now fetching from user-service
  const name = doctor.name || 'Doctor';
  const specialty = doctor.specialty || 'Specialty not set';
  
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
               style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
            {name.charAt(0)}
          </div>
          <div className="ms-3">
            <h5 className="card-title mb-0">{name}</h5>
            <div className="text-muted">{specialty}</div>
          </div>
        </div>
        
        {doctor.bio && (
          <p className="card-text" style={{ maxHeight: '3em', overflow: 'hidden' }}>
            {doctor.bio}
          </p>
        )}
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button 
            className="btn btn-primary"
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