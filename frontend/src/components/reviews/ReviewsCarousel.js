import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import api from '../../services/api';
import ReviewCard from './ReviewCard';

const ReviewsCarousel = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reviews/doctor/${doctorId}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [doctorId]);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  if (loading) return <p>Loading reviews...</p>;
  if (reviews.length === 0) return <p>No reviews yet.</p>;

  return (
    <div className="reviews-carousel-container my-4">
      <Slider {...settings}>
        {reviews.map(review => (
          <div key={review.id}>
            <ReviewCard review={review} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ReviewsCarousel;