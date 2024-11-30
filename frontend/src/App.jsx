// /frontend/src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';  

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<MapPage />} />
    </Routes>
  );
}

export default App;