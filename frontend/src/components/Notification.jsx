import React from 'react';

const Notification = ({ message, type, onClose }) => {
    if (!message) return null; // Don't render if there's no message

    const notificationStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '5px',
        color: '#fff',
        backgroundColor: type === 'success' ? 'green' : 'red',
        zIndex: 1000,
        transition: 'opacity 0.5s',
    };

    return (
        <div style={notificationStyle}>
            {message}
            <button onClick={onClose} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                &times;
            </button>
        </div>
    );
};

export default Notification;
