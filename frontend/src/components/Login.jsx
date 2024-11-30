import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('http://localhost:3500/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', username);

            setSuccessMessage('Login successful! Redirecting...');

            setTimeout(() => {
                (username === 'admin@iset.lk') ? navigate('/admin') : navigate('/');
            }, 2000);  // Redirect after 2 seconds

        } catch (error) {
            const errorMessage = error.response?.data.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const closeNotification = () => {
        setError(''); // Clear error message
        setSuccessMessage(''); // Clear success message
    };

    return (
        <div>
            <form onSubmit={handleLogin} style={formStyle}>
                <h2 style={headerStyle}>Login</h2>
                {error && <div className="error-message" style={errorStyle}>{error}</div>}
                <input
                    type="email"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={inputStyle}
                />
                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p style={footerStyle}>
                    Don't have an account? <span style={linkStyle} onClick={() => navigate('/signup')}>Sign In</span>
                </p>
            </form>

            {/* Show notifications */}
            <Notification message={successMessage || error} type={successMessage ? 'success' : 'error'} onClose={closeNotification} />
        </div>
    );
};

// Inline styles
const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9'
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

const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333'
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

const errorStyle = {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center'
};

// Modal styles
const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const modalHeaderStyle = {
    marginBottom: '10px',
    color: '#333'
};

const modalButtonStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
};

export default Login;
