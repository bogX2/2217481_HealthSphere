import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorReviews = ({ doctorId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // L'URL completo che passa attraverso l'API Gateway
                const response = await axios.get(`/api/doctors/${doctorId}/reviews`);
                setReviews(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Errore nel caricamento delle recensioni:", error);
                setLoading(false);
            }
        };

        fetchReviews();
    }, [doctorId]); // Si ricarica se cambia l'ID del dottore

    if (loading) {
        return <p>Caricamento recensioni...</p>;
    }

    return (
        <div className="reviews-section">
            <h3>Recensioni dei Pazienti</h3>
            {reviews.length > 0 ? (
                reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <h5>{review.nome} {review.cognome}</h5>
                        <p>Valutazione: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                        <p>"{review.comment}"</p>
                        <small>{new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                ))
            ) : (
                <p>Questo dottore non ha ancora ricevuto recensioni.</p>
            )}
        </div>
    );
};

export default DoctorReviews;