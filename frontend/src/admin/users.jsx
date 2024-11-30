import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [passwords, setPasswords] = useState({});
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3500/api/getallusers');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.password) {
            alert("Please fill in both fields");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3500/api/adduser', newUser);
            setUsers([...users, response.data]);
            setNewUser({ username: '', password: '' });
            setFeedback("User added successfully");
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:3500/api/deleteuser/${id}`);
            if (response.status === 200) {
                setUsers(users.filter(user => user._id !== id));
                setFeedback("User deleted successfully");
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSetPassword = async (id) => {
        const password = passwords[id];
        if (!password) {
            alert("Please enter a password");
            return;
        }

        try {
            await axios.put(`http://localhost:3500/api/setpassword/${id}`, { password });
            setFeedback("Password updated successfully");
            setPasswords({ ...passwords, [id]: '' });
        } catch (error) {
            console.error('Error setting password:', error);
        }
    };

    const handleUpdateUser = (user) => {
        setEditingUser(user);
        setNewUser({ username: user.username, password: '' }); // Password should not be pre-filled for security reasons
    };

    const handleSaveUpdate = async () => {
        if (!newUser.username || !newUser.password) {
            alert("Please fill in both fields");
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3500/api/updateuser/${editingUser._id}`, newUser);
            if (response.status === 200) {
                setUsers(users.map(user => user._id === editingUser._id ? { ...user, ...newUser } : user));
                setEditingUser(null);
                setNewUser({ username: '', password: '' });
                setFeedback("User updated successfully");
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handlePasswordChange = (userId, value) => {
        setPasswords(prevPasswords => ({
            ...prevPasswords,
            [userId]: value
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('User Report', 14, 16);
        doc.setFontSize(12);
        users.forEach((user, index) => {
            doc.text(`${index + 1}. Username: ${user.username}`, 14, 20 + (10 * index));
        });
        doc.save('user-report.pdf');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
            <h1 style={{ color: '#333' }}>Users</h1>
            {feedback && <p style={{ color: 'green' }}>{feedback}</p>} {/* Feedback message */}
            <button onClick={generatePDF} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
                Generate PDF Report
            </button>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Username</th>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                            <button 
                                    onClick={() => handleUpdateUser(user)} 
                                    style={{ 
                                        marginRight: '5px', 
                                        padding: '6px 8px', 
                                        backgroundColor: '#007bff', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '5px', 
                                        cursor: 'pointer', 
                                        transition: 'background-color 0.3s' 
                                    }} 
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} 
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                                >
                                    Update
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user._id)} 
                                    style={{ 
                                        marginRight: '5px', 
                                        padding: '6px 8px', 
                                        backgroundColor: '#dc3545', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '5px', 
                                        cursor: 'pointer', 
                                        transition: 'background-color 0.3s' 
                                    }} 
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'} 
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                                >
                                    Delete
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 style={{ marginTop: '20px' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                placeholder="Username"
                style={{ marginRight: '10px', padding: '8px', width: '200px' }}
            />
            <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="Password"
                style={{ marginRight: '10px', padding: '8px', width: '200px' }}
            />
            <button onClick={editingUser ? handleSaveUpdate : handleAddUser} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px' }}>
                {editingUser ? 'Save' : 'Add User'}
            </button>
        </div>
    );
};

export default Users;
