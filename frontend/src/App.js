import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterAdmin from './components/registerAdmin';
import RegisterUser from './components/registeruser';
import LoginAdmin from './components/loginadmin';
import LoginUser from './components/loginuser';
import AdminDashboard from './components/admindashboard';
import PostJobs from './components/postjobs';
import Userdashboard from './components/userdashboard';
import Home from './components/home';
import User from './components/user';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/postjobs" element={<PostJobs />} />
        <Route path="/userdashboard" element={<Userdashboard />} />
        <Route path="/user" element={<User />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

