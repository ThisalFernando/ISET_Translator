import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import BGimage from '../assets/BGimage.jpg';

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [translationCounts, setTranslationCounts] = useState({ hourly: 0, daily: 0, weekly: 0, monthly: 0 });

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
            fetchTranslationCounts(storedUsername);
        } else {
            navigate('/login'); // Redirect to login if not authenticated
        }
    }, [navigate]);

    const fetchTranslationCounts = async (username) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/translation-counts/${username}`);
            console.log("Translation Counts Response:", response.data); // Log response
            setTranslationCounts(response.data);
        } catch (error) {
            console.error('Error fetching translation counts:', error);
        }
    };    

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
    
        try {
            const response = await axios.post('http://localhost:3500/api/change-password', {
                username,
                newPassword
            });
    
            if (response.status === 200) {
                setSuccessMessage('Password changed successfully!');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password.';
            console.error('Error changing password:', error); // Log the error
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const closeNotification = () => {
        setError('');
        setSuccessMessage('');
    };

    return (
        <div style={formStyle}>
            <h2 style={headerStyle}>Profile</h2>
            <h3 style={subHeaderStyle}>Username: {username}</h3>
            
            <div style={countsStyle}>
                <h4>Translation Counts</h4>
                <p>Hourly: {translationCounts.hourly}</p>
                <p>Daily: {translationCounts.daily}</p>
                <p>Weekly: {translationCounts.weekly}</p>
                <p>Monthly: {translationCounts.monthly}</p>
            </div>
            
            <form onSubmit={handleChangePassword}>
                {error && <div className="error-message" style={errorStyle}>{error}</div>}
                Change Password:
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ ...inputStyle, flex: 1, marginRight: '10px' }} // Allow input to take available space
                    />
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Changing...' : 'Change'}
                    </button>
                </div>
            </form>

            {/* Show notifications */}
            <Notification message={successMessage || error} type={successMessage ? 'success' : 'error'} onClose={closeNotification} />
            <p style={footerStyle}>
                Want to log out? <span style={linkStyle} onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/login');
                }}>Log Out</span>
            </p>
        </div>
    );
};

// Inline styles
const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '400px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9'
};

const countsStyle = {
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f0f8ff'
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333'
};

const subHeaderStyle = {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#555'
};

const inputStyle = {
    margin: '10px 0',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
};

const buttonStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};

const footerStyle = {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
    color: '#555',
};

const linkStyle = {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
};

const errorStyle = {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center'
};

export default Profile;
