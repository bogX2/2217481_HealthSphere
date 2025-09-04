import { useState, useEffect } from "react";
import axios from "axios";

const useFetchUsers = (initialPage = 1, initialLimit = 10, initialRole = "", initialSearch = "") => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [role, setRole] = useState(initialRole);
  const [search, setSearch] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const params = {
        page,
        limit,
        ...(role && { role }),
        ...(search && { search }),
      };

      const res = await axios.get("http://localhost:8081/api/users", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, role, search]);

  return { users, loading, page, setPage, limit, setLimit, role, setRole, search, setSearch, totalPages, total, fetchUsers };
};

export default useFetchUsers;
