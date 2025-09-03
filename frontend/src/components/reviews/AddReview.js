import React, { useState } from 'react'; // 1. Rimuovi useContext
import reviewService from '../../services/reviewService';
import { useAuth } from '../../auth/AuthProvider'; // 2. Importa useAuth invece di AuthContext

const AddReview = ({ doctorId, onReviewAdded }) => {
    const { currentUser } = useAuth(); // 3. Usa l'hook useAuth() e prendi 'currentUser'
    
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!rating) {
            setError('Please provide a rating.');
            return;
        }

        if (!currentUser) {
            setError('You must be logged in to leave a review.');
            return;
        }

        const reviewData = {
            patientId: currentUser.id, // 4. Usa currentUser.id
            doctorId,
            rating: parseInt(rating),
            comment,
        };

        try {
            await reviewService.createReview(reviewData);
            setSuccess('Thank you for your review!');
            setRating(5);
            setComment('');
            if (onReviewAdded) {
                onReviewAdded();
            }
        } catch (err) {
            setError('Failed to submit review. Please try again.');
        }
    };

    // 5. Controlla currentUser e il suo ruolo
    if (!currentUser || currentUser.role !== 'patient') {
        return null; 
    }

    return (
        <div>
            <h4>Leave a Review</h4>
            <form onSubmit={handleSubmit}>
                {/* Il resto del tuo form rimane invariato... */}
                <div>
                    <label>Rating:</label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                    </select>
                </div>
                <div>
                    <label>Comment:</label>
                    <textarea 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                    ></textarea>
                </div>
                <button type="submit">Submit Review</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
};

export default AddReview;