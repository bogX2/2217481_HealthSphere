import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import AddReview from './AddReview'; // Il form che abbiamo già creato

const AddReviewModal = ({ show, onHide, doctor }) => {
  if (!doctor) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Leave a Review for {doctor.firstName} {doctor.lastName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddReview doctorId={doctor.id} onReviewAdded={onHide} />
      </Modal.Body>
    </Modal>
  );
};

export default AddReviewModal;