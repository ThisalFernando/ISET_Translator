import React from 'react';
import { Heading, VStack } from '@chakra-ui/react';
import MapWithSearch from '../components/MapWithSearch';  // Import the new combined component
import CreateWord from '../components/CreateWord';  // Import the CreateWord component
import Sidebar from '../components/Sidebar/Sidebar'; // Import the Sidebar component
import backgroundImage from '../components/Sidebar/Navimage/Background2.jpg';

const MapPage = () => {
    return (
        <div className="map-page-container" style={{
            backgroundImage: `url(${backgroundImage})`
          }}>
        <div className="map-page-layout" style={{ display: 'flex' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="map-page-content" style={{ marginLeft: '200px', padding: '20px', width: '100%' }}>
                {/* Header Section */}
                <VStack spacing={3} align="stretch" centerContent paddingBottom={2} paddingTop={1}>
                    <Heading as="h1" size="xl" textAlign="center" color="#2A2F33">
                        Know the Sinhala Dialectal Variations used in Sri Lanka
                    </Heading>
                </VStack>

                {/* Map with Search Component */}
                <VStack spacing={3} align="center" justify="center" paddingBottom={3} paddingTop={3} width="100%">
                    <MapWithSearch />  {/* Use the new combined component here */}
                </VStack>

                {/* Create Word Component */}
                <VStack spacing={3} align="stretch" centerContent paddingBottom={3} paddingTop={2}>
                    <CreateWord />  {/* Added the CreateWord component here */}
                </VStack>
            </div>
        </div>
        </div>
    );
};

export default MapPage;
