import api from './api';

const reviewService = {
  getReviewsByDoctor: (doctorId) => {
    return api.get(`/reviews/doctor/${doctorId}`);
  },
  createReview: (reviewData) => {
    return api.post('/reviews', reviewData);
  },
};

export default reviewService;