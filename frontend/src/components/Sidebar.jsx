import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FaChevronRight, FaBars } from 'react-icons/fa';
import navLogo from '../navLogo.png'; // Ensure the correct path to your logo
import Notification from './Notification'; // Import the Notification component

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(prevState => !prevState);
    };

    const handleLogout = () => {
        // Clear the token and any other user data from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken'); // Optional: remove refresh token if you have it

        // Set success message for logout
        setSuccessMessage('Logout successful! Redirecting...');
        
        setTimeout(() => {
            navigate('/'); // Redirect to the home page
        }, 2000);
    };

    const closeNotification = () => {
        setSuccessMessage(''); // Clear success message
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <nav className="nav">
                <div className="toggle-btn" onClick={toggleSidebar}>
                    {isOpen ? 
                        <FaChevronRight className={`icon ${isOpen ? 'rotate' : ''}`} /> : 
                        <FaBars className="icon" />}
                </div>
                <div className="logo" style={{
                    backgroundImage: `url(${navLogo})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    height: '80px',
                    margin: '20px',
                    marginTop: '40px'
                }} />
                <ul>
                    <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Link to="/" className='MainNav'>Translate</Link>
                    </li>
                    <li className={`nav-item ${location.pathname === '/dictionary' ? 'active' : ''}`}>
                        <a href='http://localhost:3000/' className='DicNav'>Dictionary</a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/dialectal-variations' ? 'active' : ''}`}>
                        <a href ='http://localhost:5174/' className='DialNav'>Dialectal Variations</a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                        <Link to="/login" className='LogNav'>Login</Link>
                    </li>
                    <li className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
                        <Link to="/signup" className='SignupNav'>Signup</Link>
                    </li>
                    <li className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        <div className='LogoutNav'>Logout</div>
                    </li>

                </ul>
            </nav>

            {/* Show notifications */}
            {successMessage && (
                <Notification 
                    message={successMessage} 
                    type="success" 
                    onClose={closeNotification} 
                />
            )}
        </div>
    );
};

export default Sidebar;
