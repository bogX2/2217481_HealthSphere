import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'


const RegisterSchema = Yup.object().shape({
  role: Yup.string().oneOf(['patient', 'doctor']).required('Seleziona un ruolo'),
  name: Yup.string().required('Nome obbligatorio'),
  surname: Yup.string().required('Cognome obbligatorio'),
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().min(6, 'Minimo 6 caratteri').required('Password obbligatoria'),
  phone: Yup.string().required('Telefono obbligatorio'),
  birthDate: Yup.date().required('Data di nascita obbligatoria'),
  birthPlace: Yup.string().required('Luogo di nascita obbligatorio'),
  fiscalCode: Yup.string().required('Codice fiscale obbligatorio'),
  specialties: Yup.string().when('role', (role, schema) => {
    return role === 'doctor'
      ? schema.required('Specialità obbligatorie per i dottori')
      : schema.notRequired();
  }),
  credentials: Yup.string().when('role', (role, schema) => {
    return role === 'doctor'
      ? schema.required('Credenziali obbligatorie per i dottori')
      : schema.notRequired();
  }),
  experience: Yup.string().when('role', (role, schema) => {
    return role === 'doctor'
      ? schema.required('Esperienza obbligatoria per i dottori')
      : schema.notRequired();
  }),
});

const Register = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header className="login-header">
        <img src="/logo192.png" alt="HealthSphere Logo" className="login-logo" />
        <h1 className="login-title">HealthSphere</h1>
      </header>


      <div className="login-container">
        <h2>Registrazione</h2>

        <Formik
          initialValues={{
            role: '',
            name: '',
            surname: '',
            email: '',
            password: '',
            phone: '',
            birthDate: '',
            birthPlace: '',
            fiscalCode: '',
            specialties: '',
            credentials: '',
            experience: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              await axios.post('http://localhost:8081/api/auth/register', values);
              setStatus({ success: 'Registrazione avvenuta con successo!' });
              navigate('/login');
            } catch (error) {
              setStatus({ error: error.response?.data?.error || 'Errore durante la registrazione' });
            }
            setSubmitting(false);
          }}
        >
          {({ values, isSubmitting, status }) => (
            <Form className="login-form">
              <div className="form-group">
                <label>Role</label>
                <Field as="select" name="role" className="form-input">
                  <option value="">Select a role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </Field>
                <ErrorMessage name="role" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>First Name</label>
                <Field type="text" name="name" className="form-input" />
                <ErrorMessage name="name" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <Field type="text" name="surname" className="form-input" />
                <ErrorMessage name="surname" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <Field type="email" name="email" className="form-input" />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Password</label>
                <Field type="password" name="password" className="form-input" />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <Field type="text" name="phone" className="form-input" />
                <ErrorMessage name="phone" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Date of birth</label>
                <Field type="date" name="birthDate" className="form-input" />
                <ErrorMessage name="birthDate" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>City of birth</label>
                <Field type="text" name="birthPlace" className="form-input" />
                <ErrorMessage name="birthPlace" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Fiscal Code</label>
                <Field type="text" name="fiscalCode" className="form-input" />
                <ErrorMessage name="fiscalCode" component="div" className="error-text" />
              </div>

              {values.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Specialization</label>
                    <Field type="text" name="specialization" className="form-input" />
                    <ErrorMessage name="specialization" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label>Certifications</label>
                    <Field type="text" name="certifications" className="form-input" />
                    <ErrorMessage name="certifications" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label>Experience</label>
                    <Field as="textarea" name="experience" className="form-input" />
                    <ErrorMessage name="experience" component="div" className="error-text" />
                  </div>
                </>
              )}

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Caricamento...' : 'Registrati'}
              </button>

              {status && status.error && <div className="status-error">{status.error}</div>}
              {status && status.success && <div className="status-success">{status.success}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
