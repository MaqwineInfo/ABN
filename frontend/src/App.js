import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddMember from './pages/AddMember';
import Meeting from './pages/Meeting';
import Setting from './pages/Setting';
import Users from './pages/Users';
import Event from './pages/event';
import AttendanceReport from './pages/attendancereport';
import ChapterReport from './pages/chapterreport';
import ChangePassword from './pages/ChangePassword';
import Login from './auth/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authToken') ? true : false;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <Sidebar handleLogout={handleLogout} /> 
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="/addMember" element={<AddMember />} /> 
              <Route path="/events" element={<Event />} />
              <Route path="/meeting" element={<Meeting />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/users" element={<Users />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/attendance-report" element={<AttendanceReport />} />
              <Route path="/business-report" element={<ChapterReport />} />
              <Route path="*" element={<Dashboard />} />
            </Routes> 
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      )}
    </>
  );
}

export default App;