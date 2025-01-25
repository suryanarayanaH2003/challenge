import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Update the path to point to the correct location

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_type: 'user', // Default user type
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData.user_type === 'admin' ? 'http://localhost:8000/register/admin/' : 'http://localhost:8000/register/user/';
    try {
      const response = await axios.post(url, formData);
      setMessage(response.data.status === 'success' ? 'Registration successful!' : 'Registration failed.');
    } catch (error) {
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="user_type"
            onChange={handleChange}
            value={formData.user_type}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Register
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Register;