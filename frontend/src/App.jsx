import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Import the user icon
import Translate from './components/Translate';
import Login from './components/Login';
import Signup from './components/Signup';
import Sidebar from './components/Sidebar'; 
import './App.css';
import logo from './navLogo.png';
import Adminpage from './admin/users.jsx';
import Profile from './components/Profile';

const App = () => {
    const [userName, setUserName] = useState(localStorage.getItem('username'));
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const handleStorageChange = () => {
            setUserName(localStorage.getItem('username'));
            setToken(localStorage.getItem('token'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const ProtectedRoute = ({ element, user }) => {
        return userName === user ? element : <Navigate to="/login" />;
    };

    return (
        <div className="app">
            <header className="app-header">
                <img src={logo} alt="Logo" className="app-logo" />
                {/* Render the profile icon conditionally */}
                {token && (
                    <div className="profile-icon">
                        <FaUserCircle size={30} onClick={() => window.location.href = '/profile'} />
                    </div>
                )}
            </header>
            <Sidebar />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Translate />} />
                    <Route path="/auth/:username" element={<Translate />} />
                    <Route path="/login" element={<Login setUserName={setUserName} setToken={setToken} />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route 
                        path="/admin" 
                        element={<ProtectedRoute user={"admin@iset.lk"} element={<Adminpage />} />} 
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;
