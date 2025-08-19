// frontend\src\utils\userService.js

// Utility to fetch public details of a user by ID
// Assumes your API Gateway proxies /api/users/:id to user-service
// and user-service has an endpoint like GET /api/users/:id/public

export const fetchUserDetails = async (userId) => {
  const token = localStorage.getItem('token'); // Or get from your auth context

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/api/users/${userId}/public`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Ensure user-service endpoint allows this or is public for internal service calls
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Handle different error statuses if needed (e.g., 404 Not Found)
    if (response.status === 404) {
         throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user details: ${response.statusText}`);
  }

  const userData = await response.json();
  return userData;
};