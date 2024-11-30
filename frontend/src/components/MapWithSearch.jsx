import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Input, Flex, Spacer } from '@chakra-ui/react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DistrictMapping } from '../constants/DistrictMappping';
import Swal from 'sweetalert2';

const MapWithSearch = () => {
    const [searchWord, setSearchWord] = useState('');
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [userWord, setUserWord] = useState('');
    const [userWordId, setUserWordId] = useState('');
    const [geoData, setGeoData] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [newWord, setNewWord] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Handle Search for Word
    const handleSearch = async () => {
        if (!searchWord) {
            Swal.fire({
                icon: "error",
                title: "OOPS...",
                text: "No search word is input!",
              });
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/userWords?word=${searchWord}`);
            const userWordData = response.data;

            if (userWordData) {
                console.log('Fetched userWordData:', userWordData);
                setFilteredDistricts(userWordData.associatedWords || []);
                setUserWord(searchWord);
                setUserWordId(userWordData._id);
                setShowActions(true);
            } else {
                console.log('No user word found');
                setShowActions(false);
                setFilteredDistricts([]);
            }
        } catch (error) {
            console.error("Error fetching user word:", error.response ? error.response.data.error : "Network or other error");
            setShowActions(false);
        }
    };

    // Handle Update User Word
    const handleUpdateUserWord = async () => {
        if (!userWordId || !newWord) {
            console.error("No user word selected for update or no new word specified");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/userWords/${userWordId}`, { word: newWord });
            console.log("User word updated successfully");
            setEditMode(false);
            setSearchWord(newWord);  // Set the searchWord to newWord to keep the UI consistent
            handleSearch();  // Re-fetch to refresh associated words on the map
        } catch (error) {
            console.error("Error updating user word:", error);
        }
    };

    // Handle Delete User Word
    const handleDeleteUserWord = async () => {
        if (!userWordId) {
            console.error("No user word selected for deletion");
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/api/userWords/${userWordId}`);
            console.log("User word deleted successfully");
            setFilteredDistricts([]);
            setUserWord('');
            setUserWordId('');
            setShowActions(false);
            setSearchWord('');  // Reset the search word
        } catch (error) {
            console.error("Error deleting user word:", error);
        }
    };

    // Fetch GeoJSON data
    useEffect(() => {
        axios.get('http://localhost:5000/api/geojson')
            .then(response => setGeoData(response.data))
            .catch(error => console.error("Error loading GeoJSON:", error));
    }, []);

    // Handle updating, creating, and deleting associated words
    useEffect(() => {
        window.updateAssociatedWord = (districtId) => {
            const newWord = prompt('Enter new associated word:');
            if (newWord) {
                axios.put(`http://localhost:5000/api/userWords/${userWordId}/associated/${districtId}`, { word: newWord })
                    .then(response => {
                        console.log('Updated successfully:', response.data);
                    })
                    .catch(error => console.error('Failed to update word:', error));
            }
        };

        window.deleteAssociatedWord = (districtId) => {
            axios.delete(`http://localhost:5000/api/userWords/${userWordId}/associated/${districtId}`)
                .then(response => {
                    console.log('Deleted successfully:', response.data);
                })
                .catch(error => console.error('Failed to delete word:', error));
        };

        window.createAssociatedWord = (districtId) => {
            if (!userWordId) {
                console.error('userWordId is missing');
                return;
            }
            const newWord = prompt('Enter associated word:');
            if (newWord) {
                const districtName = DistrictMapping[districtId];
                axios.post(`http://localhost:5000/api/userWords/${userWordId}/associated`, { districtId, word: newWord, districtName })
                    .then(response => {
                        console.log('Created successfully:', response.data);
                    })
                    .catch(error => console.error('Failed to create word:', error));
            }
        };

        return () => {
            delete window.updateAssociatedWord;
            delete window.deleteAssociatedWord;
            delete window.createAssociatedWord;
        };
    }, [userWordId]);

    // Update GeoData based on filteredDistricts
    useEffect(() => {
        if (geoData && filteredDistricts) {
            const newGeoData = {
                ...geoData,
                features: geoData.features.map(feature => {
                    const found = filteredDistricts.find(d => d.districtId === feature.properties.id);
                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            associatedWord: found ? found.word : undefined
                        }
                    };
                })
            };
            setGeoData(newGeoData);
        }
    }, [filteredDistricts, geoData]);

    // Render GeoJSON features with custom popups
    const onEachFeature = (feature, layer) => {
        const districtData = filteredDistricts.find(d => d.districtId === feature.properties.id);
        const style = {
            fillColor: districtData ? "green" : "#F5C461",
            weight: 2,
            color: 'black',
            fillOpacity: 0.6,
        };
        layer.setStyle(style);

        const popupContent = districtData
            ? `<div style="padding: 12px; font-family: 'Arial', sans-serif; color: #333;">
                <h3 style="font-size: 18px; margin-bottom: 8px;">${feature.properties.name} (${districtData.districtName})</h3>
                <h2 style="margin-bottom: 12px;">Regional Dialect: ${districtData.word}</h2>
                <button style="background-color: #3182ce; color: white; border: none; padding: 8px 12px; margin-right: 4px; cursor: pointer;" onclick="window.updateAssociatedWord('${districtData.districtId}')">Update</button>
                <button style="background-color: #e53e3e; color: white; border: none; padding: 8px 12px; cursor: pointer;" onclick="window.deleteAssociatedWord('${districtData.districtId}')">Delete</button>
              </div>`
            : `<div style="padding: 12px; font-family: 'Arial', sans-serif; color: #333;">
                <h3 style="font-size: 18px;">${feature.properties.name}</h3>
                <button style="background-color: #3182ce; color: white; border: none; padding: 8px 12px; cursor: pointer; margin-top: 8px;" onclick="window.createAssociatedWord('${feature.properties.id}')">Create</button>
              </div>`;

        layer.bindPopup(popupContent);
    };

    return (
        <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            {/* Search and Word Management */}
            <Box width="100%"> {/* Ensure full width for the search form */}
                <Flex as="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }} align="center" mb={5} justifyContent="center">
                    <Input
                        placeholder="Enter a Sinhala word you like"
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        width="300px"
                        mr={2}
                        color="#2A2F33"  /* Sets the input text color to white */
                        _placeholder={{ color: "#2A2F33" }}  /* Ensures placeholder text is also white */
                        borderColor= "black"
                        borderWidth="2px"
            
                    />
                    <Button colorScheme="blue" type="submit">Search</Button>
                    {showActions && (
                        <Flex align="center" ml="4">
                            <Button colorScheme="red" onClick={handleDeleteUserWord} mr={2}>Delete</Button>
                            <Button colorScheme="green" onClick={() => { setEditMode(true); setNewWord(searchWord); }} mr={2}>Update</Button>
                            {editMode && (
                                <Flex align="center">
                                    <Input
                                        placeholder="Enter a new word"
                                        value={newWord}
                                        onChange={(e) => setNewWord(e.target.value)}
                                        width="200px"
                                        mr={2}
                                        color="#2A2F33"  /* Sets the input text color to white */
                                        _placeholder={{ color: "#2A2F33" }}  /* Ensures placeholder text is also white */
                                    />
                                    <Button colorScheme="teal" onClick={handleUpdateUserWord}>Enter</Button>
                                </Flex>
                            )}
                        </Flex>
                    )}
                </Flex>
            </Box>
    
            {/* Map Component */}
            <Box height="500px" width="90%" className="map-container">
                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {geoData && (
                        <GeoJSON
                            key={JSON.stringify(filteredDistricts.map(item => item.districtId).sort())}
                            data={geoData}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </Box>
        </Box>
    );
    
};

export default MapWithSearch;
