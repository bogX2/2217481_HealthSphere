import React, { useState } from 'react';
import axios from 'axios';

const LeaveReviewForm = ({ doctorId, appointmentId, onReviewSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!comment) {
            setError("Per favore, scrivi un commento.");
            return;
        }

        try {
            // Assicurati di inviare il token di autenticazione!
            // Axios può essere configurato per includerlo automaticamente in tutte le richieste.
            await axios.post(`/api/doctors/${doctorId}/reviews`, {
                appointmentId,
                rating,
                comment
            });
            setSuccess("Grazie per la tua recensione!");
            if (onReviewSubmit) {
                onReviewSubmit(); // Funzione per nascondere il form dopo l'invio
            }
        } catch (err) {
            setError("Si è verificato un errore. Potresti aver già lasciato una recensione per questo appuntamento.");
            console.error(err);
        }
    };

    return (
        <div className="leave-review-form">
            <h4>Lascia una Recensione</h4>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Valutazione:</label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        <option value={5}>5 Stelle ★★★★★</option>
                        <option value={4}>4 Stelle ★★★★☆</option>
                        <option value={3}>3 Stelle ★★★☆☆</option>
                        <option value={2}>2 Stelle ★★☆☆☆</option>
                        <option value={1}>1 Stella ★☆☆☆☆</option>
                    </select>
                </div>
                <div>
                    <label>Commento:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Descrivi la tua esperienza..."
                        required
                    />
                </div>
                <button type="submit">Invia Recensione</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
};

export default LeaveReviewForm;