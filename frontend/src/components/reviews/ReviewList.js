import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';

const ReviewList = ({ doctorId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await reviewService.getReviewsByDoctor(doctorId);
                setReviews(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch reviews.');
                setLoading(false);
            }
        };

        if (doctorId) {
            fetchReviews();
        }
    }, [doctorId]);

    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h3>Reviews</h3>
            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.id}>
                            <p><strong>Rating: {review.rating}/5</strong></p>
                            <p>{review.comment}</p>
                            <small>Patient ID: {review.patientId}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReviewList;