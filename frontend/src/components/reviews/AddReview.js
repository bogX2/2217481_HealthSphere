import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../services/api';

const AddReview = ({ doctorId, onReviewAdded }) => {
    const { currentUser } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- AGGIUNGI QUESTO CONTROLLO DI SICUREZZA ---
    if (!currentUser) {
        setError('Unable to verify user. Please refresh and try again.');
        return; // Interrompe l'esecuzione se currentUser è null
    }
        if (rating === 0) {
            setError('Please select a rating by clicking the stars.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const reviewData = {
            patientId: currentUser.id,
            doctorId,
            rating,
            comment,
        };

        try {
            await api.post('/reviews', reviewData);
            setSuccess('Thank you for your review!');
            setTimeout(() => {
                onReviewAdded(); 
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };
    
    const Star = ({ index, rating, hoverRating, onMouseEnter, onMouseLeave, onClick }) => (
        <i 
            className={`bi bi-star${(hoverRating || rating) >= index ? '-fill' : ''} text-warning fs-2`}
            onMouseEnter={() => onMouseEnter(index)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(index)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        ></i>
    );

    return (
        <div className="add-review-form">
            <div className="text-center mb-3">
                <h5 className="mb-3">Rate your experience</h5>
                <div className="d-flex justify-content-center">
                    {[1, 2, 3, 4, 5].map(index => (
                        <Star 
                            key={index}
                            index={index}
                            rating={rating}
                            hoverRating={hoverRating}
                            onMouseEnter={(i) => setHoverRating(i)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={(i) => setRating(i)}
                        />
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="comment" className="form-label fw-bold">Leave a comment</label>
                    <textarea 
                        className="form-control" 
                        id="comment" 
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe your experience..."
                        disabled={isSubmitting}
                    ></textarea>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                {' '}Submitting...
                            </>
                        ) : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddReview;