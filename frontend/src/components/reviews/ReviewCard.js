import React from 'react';

const ReviewCard = ({ review }) => {
  // Funzione per generare le stelle del rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`bi bi-star${i <= rating ? '-fill' : ''} text-warning`}
        ></i>
      );
    }
    return stars;
  };

  // Determina il nome da visualizzare
  // Si aspetta un oggetto 'patient' dentro 'review'. Se non c'è, mostra l'ID.
  const patientName = review.patient 
    ? `${review.patient.firstName} ${review.patient.lastName}`
    : `Paziente ID: ${review.patientId}`;

  return (
    <div className="card h-100 m-2 shadow-sm border-light">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          {/* Aggiungiamo un'icona per il profilo del paziente */}
          <div className="d-flex align-items-center">
            <i className="bi bi-person-circle fs-4 text-secondary me-2"></i>
            <span className="fw-bold">{patientName}</span>
          </div>
          {/* Stelle del rating */}
          <div className="fs-5">{renderStars(review.rating)}</div>
        </div>
        
        <hr />

        {/* Commento con icona di citazione */}
        <div className="text-muted fst-italic flex-grow-1">
          <i className="bi bi-quote me-1"></i>
          {review.comment || 'Nessun commento lasciato.'}
        </div>

        {/* Data della recensione in basso a destra */}
        <small className="text-end text-muted mt-3">
          {new Date(review.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default ReviewCard;