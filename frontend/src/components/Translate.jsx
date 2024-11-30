import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Removed useLocation since it's no longer needed
import axios from "axios";
import characterMap from "../characterMap/characterMap";
import reverseCharacterMap from "../characterMap/reverseCharacterMap";
import countries from "../data";
import Swal from 'sweetalert2'

import {
    FaVolumeUp,
    FaCopy,
    FaTrash,
    FaEdit,
    FaExchangeAlt,
    FaStar,
    FaRegStar,
    FaPaste,
    FaTrashAlt,
    FaFileDownload 
} from 'react-icons/fa';

// Helper function for API requests
const fetchFromApi = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.responseData) {
            return data.responseData.translatedText;
        }
        throw new Error('Invalid response data');
    } catch (error) {
        console.error('API Error:', error);
        return '';
    }
};

// Convert Sinhala text to Singlish
const convertSinhalaToSinglish = (sinhalaText) => {
    let singlishText = '';
    for (let i = 0; i < sinhalaText.length; i++) {
        let char = sinhalaText[i];
        let nextChar = sinhalaText[i + 1];
        let twoCharCombo = char + (nextChar || '');

        if (characterMap[twoCharCombo]) {
            singlishText += characterMap[twoCharCombo];
            i++;
        } else if (characterMap[char]) {
            singlishText += characterMap[char];
        } else {
            singlishText += char;
        }
    }
    return singlishText;
};

// Convert Singlish text to Sinhala
const convertSinglishToSinhala = (singlishText) => {
    let sinhalaText = '';
    let i = 0;
    while (i < singlishText.length) {
        let char = singlishText[i];
        let nextChar = singlishText[i + 1];
        let nextTwoCharCombo = nextChar ? char + nextChar : char;
        let nextThreeCharCombo = nextChar && singlishText[i + 2] ? char + nextChar + singlishText[i + 2] : nextTwoCharCombo;
        let nextFourCharCombo = nextThreeCharCombo && singlishText[i + 3] ? nextThreeCharCombo + singlishText[i + 3] : nextThreeCharCombo;
        let nextFiveCharCombo = nextFourCharCombo && singlishText[i + 4] ? nextFourCharCombo + singlishText[i + 4] : nextFourCharCombo;

        if (reverseCharacterMap[nextFiveCharCombo]) {
            sinhalaText += reverseCharacterMap[nextFiveCharCombo];
            i += 5; // Advance by 5 characters
        } else if (reverseCharacterMap[nextFourCharCombo]) {
            sinhalaText += reverseCharacterMap[nextFourCharCombo];
            i += 4; // Advance by 4 characters
        } else if (reverseCharacterMap[nextThreeCharCombo]) {
            sinhalaText += reverseCharacterMap[nextThreeCharCombo];
            i += 3; // Advance by 3 characters
        } else if (reverseCharacterMap[nextTwoCharCombo]) {
            sinhalaText += reverseCharacterMap[nextTwoCharCombo];
            i += 2; // Advance by 2 characters
        } else if (reverseCharacterMap[char]) {
            sinhalaText += reverseCharacterMap[char];
            i++; // Advance by 1 character
        } else {
            sinhalaText += char;
            i++;
        }
    }
    return sinhalaText;
};

// Convert English to Singlish (via Sinhala)
const convertEnglishToSinglish = async (englishText) => {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|si`;
    const sinhalaText = await fetchFromApi(apiUrl);
    return convertSinhalaToSinglish(sinhalaText);
};

// Convert Singlish to English (via Sinhala)
const convertSinglishToEnglish = async (singlishText) => {
    const sinhalaText = convertSinglishToSinhala(singlishText);
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sinhalaText)}&langpair=si|en`;
    return await fetchFromApi(apiUrl);
};

// Sorting function
const sortHistory = (historyArray) => {
    return historyArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const Translate = () => {
    const [history, setHistory] = useState([]);
    const [fromTextValue, setFromTextValue] = useState("");
    const [toTextValue, setToTextValue] = useState("");
    const [fromLang, setFromLang] = useState("en-GB");
    const [toLang, setToLang] = useState("si-LK");
    const [loading, setLoading] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false); // State for showing favorites
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchHistory = async () => {
            console.log(token);
            console.log("Test");
            try {
                const response = await axios.get("http://localhost:3500/api/history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setHistory(sortHistory(response.data));
                } else {
                    console.error('Failed to fetch history, status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching history:', error.response ? error.response.data : error.message);
            }
        };

        const fetchUserInfo = async () => {
            if (!token) {
                console.error('No token found. User may not be logged in.');
                setIsHistoryVisible(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:3500/api/user", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsername(response.data.username);
                setIsHistoryVisible(false);
                fetchHistory();
            } catch (error) {
                if (error.response?.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        try {
                            const refreshResponse = await axios.post("http://localhost:3500/refresh-token", { refreshToken });
                            localStorage.setItem('token', refreshResponse.data.accessToken);
                            return fetchUserInfo();  // Retry fetching user info
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            // Optionally, you can redirect to login or show an error message
                            setIsHistoryVisible(false);
                            navigate("/login"); // Redirect to login page
                        }
                    } else {
                        // No refresh token, redirect to login
                        setIsHistoryVisible(false);
                        navigate("/login");
                    }
                }
                console.error('Error fetching user info:', error.response ? error.response.data : error.message);
                setIsHistoryVisible(false);
            }
        };

        fetchUserInfo();
    }, [token, navigate]);

    const handleTranslation = async () => {
    
        const text = fromTextValue.trim();
        if (!text){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No text is input!",
              });
        }
    
        else{
        setLoading(true);
        setToTextValue("Translating...");
    
        let translatedText = "";
    
        try {
            if (fromLang === "si-LK" && toLang === "si-LK-roman") {
                translatedText = convertSinhalaToSinglish(text);
            } else if (fromLang === "si-LK-roman" && toLang === "si-LK") {
                translatedText = convertSinglishToSinhala(text);
            } else if (fromLang === "en-GB" && toLang === "si-LK-roman") {
                translatedText = await convertEnglishToSinglish(text);
            } else if (fromLang === "si-LK-roman" && toLang === "en-GB") {
                translatedText = await convertSinglishToEnglish(text);
            } else {
                const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
                translatedText = await fetchFromApi(apiUrl);
            }
    
            setToTextValue(translatedText);
    
            const newEntry = {
                fromText: text,
                toText: translatedText,
                fromLang,
                toLang,
                username
            };
    
            const savedEntryRes = await fetch("http://localhost:3500/api/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newEntry),
            });
    
            if (!savedEntryRes.ok) throw new Error('Failed to save translation');
    
            const savedEntry = await savedEntryRes.json();
            setHistory(prevHistory => sortHistory([...prevHistory, savedEntry]));
        } catch (error) {
            console.error('Error during translation or saving:', error);
            if (token) { // Check if token is not null
                setToTextValue("Error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
        }
    };
    

    const deleteHistoryEntry = async (id) => {
        try {
            await axios.delete(`http://localhost:3500/api/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(prevHistory => sortHistory(prevHistory.filter(entry => entry._id !== id)));
        } catch (error) {
            console.error('Error deleting history entry:', error);
        }
    };

    const deleteAllHistoryEntries = async () => {
        try {
            const response = await axios.delete('http://localhost:3500/api/history/deleteAll', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            setHistory([]); // Clear history in state
        } catch (error) {
            console.error('Error deleting all history entries:', error);
            alert('Failed to delete all history entries: ' + (error.response ? error.response.data.message : 'Unknown error'));
        }
    };

    const reEditHistoryEntry = (entry) => {
        setFromTextValue(entry.fromText);
        setFromLang(entry.fromLang);
        setToLang(entry.toLang);
    };

    // Function to swap languages
    const swapLanguages = () => {
        setFromTextValue(toTextValue);
        setToTextValue(fromTextValue);
        setFromLang(toLang);
        setToLang(fromLang);
    };

    const toggleFavorite = async (id) => {
        try {
            const response = await fetch(`http://localhost:3500/api/history/${id}/favorite`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to update favorite status');
            const updatedEntry = await response.json();
            setHistory(prevHistory => sortHistory(prevHistory.map(entry =>
                entry._id === id ? updatedEntry : entry
            )));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setFromTextValue(text);
        } catch (error) {
            console.error('Failed to paste from clipboard:', error);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const generateReport = () => {
        const reportData = filteredHistory.map(entry => {
            return `${countries[entry.fromLang]}: ${entry.fromText} → ${countries[entry.toLang]}: ${entry.toText} (Date: ${new Date(entry.createdAt).toLocaleString()})`;
        }).join('\n\n');
    
        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translation_history.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleHistoryToggle = () => {
        setIsHistoryVisible(prev => !prev);
    };

    const filteredHistory = showFavorites
        ? history.filter(entry => entry.isFavorite)
        : history;

    // Placeholder for speakText function
    const speakText = (text) => {
        // Implement text-to-speech functionality here
        console.log("Speak:", text);
    };

    // In your Translate component
    return (
        <div>
            <div className="container">
                <div className="wrapper">
                    <div className="text-input">
                        <textarea
                            spellCheck="false"
                            className="from-text"
                            placeholder="Enter text"
                            value={fromTextValue}
                            onChange={(e) => setFromTextValue(e.target.value)}
                        />
                        <textarea
                            spellCheck="false"
                            readOnly
                            className="to-text"
                            placeholder="Translation"
                            value={toTextValue}
                        />
                    </div>
                    <ul className="controls">
                        <li className="row from">
                            <div className="icons">
                                <FaVolumeUp className="icon" onClick={() => speakText(fromTextValue)} />
                                &nbsp;&nbsp;
                                <FaPaste className="icon" onClick={pasteFromClipboard} />
                            </div>
                            <select
                                className="icon"
                                value={fromLang}
                                onChange={(e) => setFromLang(e.target.value)}
                            >
                                {Object.keys(countries).map((key) => (
                                    <option key={key} value={key}>
                                        {countries[key]}
                                    </option>
                                ))}
                            </select>
                        </li>
                        <li className="exchange">
                            <i className="swap-button" onClick={swapLanguages}>
                                <FaExchangeAlt className="icon" />
                            </i>
                        </li>
                        <li className="row to">
                            <select
                                className="icon"
                                value={toLang}
                                onChange={(e) => setToLang(e.target.value)}
                            >
                                {Object.keys(countries).map((key) => (
                                    <option key={key} value={key}>
                                        {countries[key]}
                                    </option>
                                ))}
                            </select>
                            <div className="icons">
                                <FaVolumeUp className="icon" onClick={() => speakText(toTextValue)} />
                                &nbsp;&nbsp;
                                <FaCopy className="icon" onClick={() => copyToClipboard(toTextValue)} />
                            </div>
                        </li>
                    </ul>
                </div>
                <button
                    className="submit-button"
                    onClick={handleTranslation}
                >
                    {loading ? 'Translating...' : 'Translate'}
                </button>
            </div>
            <br />
            {/* Translation History Container */}
            {token ? ( // Only show the history container if a token exists
                <div className="container">
                    <div className="history-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 onClick={handleHistoryToggle} style={{ cursor: 'pointer', margin: 0 }}>
                                Translation History
                            </h3>
                            {isHistoryVisible && (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setShowFavorites(!showFavorites)}
                                        style={{
                                            marginBottom: '1px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showFavorites ? (
                                            <>
                                            <span style={{ color: 'gray' }}>Show All</span> 
                                            <FaStar style={{ marginLeft: '5px', color: 'purple' }} className="icon" />
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: 'gray' }}>Show Favorites</span> 
                                            <FaRegStar style={{ marginLeft: '1px' }} className="icon" />
                                        </>
                                        )}
                                    </button>
                                    <button
                                        onClick={deleteAllHistoryEntries}
                                        style={{
                                            marginBottom: '1px',
                                            marginLeft: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ color: 'gray' }}> Delete All </span> <FaTrashAlt style={{ color: 'red', marginLeft: '5px' }} className="icon" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {isHistoryVisible && (
                            <div className="history" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                <ul>
                                    {filteredHistory.map((entry) => (
                                        <li key={entry._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <button
                                                className="icon"
                                                onClick={() => toggleFavorite(entry._id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    marginTop: '5px',
                                                    marginRight: '20px',
                                                    width: '20px'
                                                }}
                                            >
                                                {entry.isFavorite ? <FaStar color="purple" /> : <FaRegStar color="gray" />}
                                            </button>
                                            <div>
                                                <strong>{countries[entry.fromLang]}:</strong> {entry.fromText} → <br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <strong>{countries[entry.toLang]}:</strong> {entry.toText}
                                                <p>{new Date(entry.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="actions" style={{ textAlign: 'right', width: '40px' }}>
                                                <button
                                                    style={{ fontSize: '12px', padding: '8px 8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => reEditHistoryEntry(entry)}
                                                >
                                                    <FaEdit className="icon" />
                                                </button>
                                                <button
                                                    style={{ fontSize: '12px', padding: '8px 8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => deleteHistoryEntry(entry._id)}
                                                >
                                                    <FaTrash className="icon" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <center>
                                    <button
                                        className="report-button"
                                        onClick={generateReport}
                                        style={{ width: '95%' }}
                                    >
                                        <FaFileDownload style={{ marginRight: '5px' }} />
                                        Generate Report
                                    </button>
                                </center>
                            </div>
                        )}
                    </div>
                </div>
            ) : <center>Please log in to see your translation history.</center>} 
        </div>
    );
};

export default Translate;
