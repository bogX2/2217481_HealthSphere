import React from "react";
import { useNavigate } from "react-router-dom";
import useFetchUsers from "./useFetchUsers";
import axios from "axios";

const AdminUsers = () => {
  const navigate = useNavigate();
  const {
    users,
    loading,
    page,
    setPage,
    role,
    setRole,
    search,
    setSearch,
    totalPages,
    total,
    fetchUsers,
  } = useFetchUsers();

  // Disattiva utente
  const handleDeactivate = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:8081/api/users/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deactivated successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert("Failed to deactivate user");
    }
  };

  // Riattiva utente
  const handleActivate = async (userId) => {
    if (!window.confirm("Are you sure you want to activate this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:8081/api/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User activated successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error activating user:", err);
      alert("Failed to activate user");
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <h2 className="text-center text-success mb-4">All Users</h2>

      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>
        <button
          className="btn btn-success"
          onClick={() => { setPage(1); fetchUsers(); }}
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.firstName || u.profile?.firstName || "-"}</td>
                  <td>{u.lastName || u.profile?.lastName || "-"}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.isActive ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeactivate(u.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleActivate(u.id)}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="btn btn-outline-primary"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      <p className="mt-3">Total users: {total}</p>
    </div>
  );
};

export default AdminUsers;
