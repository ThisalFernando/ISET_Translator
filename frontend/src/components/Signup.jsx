import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification'; // Import the Notification component

const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // State for success message

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3500/api/auth/signup', {
                username,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', username);
            setSuccessMessage('Signup successful! Redirecting...'); // Set success message

            setTimeout(() => {
                navigate('/'); // Redirect to home
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data.message || 'Signup failed.';
            setError(errorMessage); // Set error message
            console.error('Signup failed:', error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeNotification = () => {
        setSuccessMessage(''); // Clear success message
        setError(''); // Clear error message
    };

    return (
        <div>
            <form onSubmit={handleSignup} style={formStyle}>
                <h2 style={headerStyle}>Create Account</h2>
                {error && <div className="error-message" style={errorStyle}>{error}</div>}
                <input 
                    type="text" 
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
                    autoComplete="new-password"
                    style={inputStyle}
                />
                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                <p style={footerStyle}>
                    Already have an account? <span style={linkStyle} onClick={() => navigate('/login')}>Login here</span>
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
    width: '350px',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
};

const inputStyle = {
    margin: '10px 0',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
};

const buttonStyle = {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#ffffff',
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
    textAlign: 'center',
};

export default Signup;
