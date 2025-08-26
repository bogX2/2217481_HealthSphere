import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterSchema = Yup.object().shape({
  role: Yup.string().oneOf(['patient', 'doctor']).required('Select a role'),
  name: Yup.string().required('First Name is required'),
  surname: Yup.string().required('Last Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  birthDate: Yup.date().required('Birth Date is required'),
  birthPlace: Yup.string().required('Birth City is required'),
  fiscalCode: Yup.string().required('Fiscal Code is required'),
});

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: '#e8f7f5' }}>
      <div className={`card shadow-lg p-5 rounded-4`} style={{ maxWidth: '600px', borderColor: 'transparent', backgroundColor: '#ffffff' }}>
        <div className="d-flex align-items-center mb-4">
          <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
          <h1 className="h4 fw-bold text-dark mb-0">HealthSphere</h1>
        </div>

        <h2 className="text-center mb-4 h3 fw-bold">Registration</h2>

        <Formik
          initialValues={{
            role: '',
            name: '',
            surname: '',
            email: '',
            password: '',
            phoneNumber: '',
            birthDate: '',
            birthPlace: '',
            fiscalCode: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              await axios.post('http://localhost:8081/api/auth/register', values);
              setStatus({ success: 'Registration successful!' });
              navigate('/login');
            } catch (error) {
              setStatus({ error: error.response?.data?.error || 'Error during registration' });
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Role</label>
                <Field as="select" name="role" className="form-select rounded-pill">
                  <option value="">Select a role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </Field>
                <ErrorMessage name="role" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">First Name</label>
                <Field type="text" name="name" className="form-control rounded-pill" />
                <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Last Name</label>
                <Field type="text" name="surname" className="form-control rounded-pill" />
                <ErrorMessage name="surname" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Email</label>
                <Field type="email" name="email" className="form-control rounded-pill" />
                <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Password</label>
                <Field type="password" name="password" className="form-control rounded-pill" />
                <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Phone Number</label>
                <Field type="text" name="phoneNumber" className="form-control rounded-pill" />
                <ErrorMessage name="phoneNumber" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Date of birth</label>
                <Field type="date" name="birthDate" className="form-control rounded-pill" />
                <ErrorMessage name="birthDate" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">City of birth</label>
                <Field type="text" name="birthPlace" className="form-control rounded-pill" />
                <ErrorMessage name="birthPlace" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">Fiscal Code</label>
                <Field type="text" name="fiscalCode" className="form-control rounded-pill" />
                <ErrorMessage name="fiscalCode" component="div" className="text-danger small mt-1" />
              </div>

              <div className="col-12 mt-4 d-grid gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-outline-success btn-lg rounded-pill"
                >
                  {isSubmitting ? 'Loading...' : 'Register'}
                </button>
              </div>

              {status && status.error && <div className="text-danger text-center mt-3 small">{status.error}</div>}
              {status && status.success && <div className="text-success text-center mt-3 small">{status.success}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;