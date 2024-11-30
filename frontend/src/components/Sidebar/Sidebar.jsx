import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import navLogo from '../Sidebar/Navimage/navLogo.png'; // Ensure the correct path to your logo

const Sidebar = () => {
    const location = useLocation(); // To detect which route is active

    return (
        <div className="sidebar">
            <nav className="nav">
                <div className="logo" style={{
                    backgroundImage: `url(${navLogo})`, // Correct way to use `url()`
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    height: '80px'
                }} />
                <ul>
                    <li>
                        <a href='http://localhost:5173/' className='MainNav'>Translate</a>
                    </li>
                    <li>
                        <a href='http://localhost:3000/' className='DicNav'>Dictionary</a>
                    </li>
                    <li>
                        <a href='http://localhost:5174/' className='DialNav'>Dialectal Variations</a>
                    </li>
                    <li>
                        <a href='http://localhost:5173/login' className='LogNav'>Login</a>
                    </li>
                    <li>
                        <a href='http://localhost:5173/signup' className='SignupNav'>Signup</a>
                    </li>
                    <li>
                        <Link to="/logout" className='LogoutNav'>Logout</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
