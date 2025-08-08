# 2217481_HealthSphere

## Available Endpoints (through API Gateway :3000)

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### User Management  
- GET `/api/users/profile` - Get own profile (JWT required)
- PUT `/api/users/profile` - Update profile (JWT required)
- GET `/api/users` - Get all users (Admin only)
- PATCH `/api/users/:id/deactivate` - Deactivate user (Admin only)