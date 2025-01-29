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
import UserProfile from './components/UserProfile';
import ForgotPassword from './components/forgotpassword';
import EditJob from './components/EditJob';
import DeleteJob from './components/DeleteJob';
import SavedJobs from './components/SavedJobs';
import PortalLogin from './components/portallogin';
import PortalRegister from './components/portalregister';
import PortalDashboard from './components/portaldashboard';
import GuestDashboard from './components/GuestDashboard';
import Deadline from './components/Deadline';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/deadline" element={<Deadline />} />
        <Route path="/portal-dashboard" element={<PortalDashboard />} />
        <Route path="/portal-login" element={<PortalLogin />} />
        <Route path="/portal-register" element={<PortalRegister />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/postjobs" element={<PostJobs />} />
        <Route path="/userdashboard" element={<Userdashboard />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/editjob/:jobId" element={<EditJob />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/deletejob/:jobId" element={<DeleteJob />} />
        <Route path="/savedjobs" element={<SavedJobs />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

