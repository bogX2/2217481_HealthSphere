// frontend/src/pages/prescriptions/PrescriptionList.js

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Header from '../../components/layout/Header';
import documentService from '../../services/documentService';
import { FileEarmarkPdf, Download } from 'react-bootstrap-icons';

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    // Funzione per gestire il download del file
    const handleDownload = async (prescription) => {
        try {
            const response = await documentService.downloadPrescription(prescription.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', prescription.fileName); // Usa il nome originale del file
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error downloading prescription:', err);
            setError('Failed to download prescription.');
        }
    };

    // Al caricamento, recupera il profilo utente e poi le sue ricette
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // 1. Recupera il profilo dell'utente loggato
                const userResponse = await axios.get('http://localhost:8081/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentUser = userResponse.data.user;
                setUser(currentUser);

                // 2. Usa l'ID dell'utente per recuperare le ricette
                const prescriptionResponse = await documentService.getPrescriptionsForPatient(currentUser.id);
                setPrescriptions(prescriptionResponse.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load prescriptions.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // Funzione per renderizzare il contenuto
    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-3 text-muted">Loading prescriptions...</p>
                </div>
            );
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        if (prescriptions.length === 0) {
            return <Alert variant="info">You have no prescriptions.</Alert>;
        }

        return (
            <Row xs={1} md={2} lg={3} className="g-4">
                {prescriptions.map(prescription => (
                    <Col key={prescription.id}>
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <FileEarmarkPdf size={40} className="me-3 text-danger" />
                                    <div>
                                        <h5 className="card-title mb-1">{prescription.fileName}</h5>
                                        <small className="text-muted">
                                            Uploaded on: {new Date(prescription.uploadDate).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                                <p className="card-text flex-grow-1">
                                    <strong>Notes:</strong> {prescription.notes || 'N/A'}
                                </p>
                                <Button variant="success" onClick={() => handleDownload(prescription)}>
                                    <Download className="me-2" /> Download
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <div className="d-flex flex-column bg-light min-vh-100">
            <Header user={user} />
            <Container className="mt-5 pt-5 pb-5">
                <section className="mb-5 text-center pt-5">
                    <h2 className="display-5 fw-bold text-success">My Prescriptions</h2>
                    <p className="lead text-muted">Here you can find all the documents uploaded by your doctors.</p>
                </section>
                {renderContent()}
            </Container>
        </div>
    );
};

export default PrescriptionList;