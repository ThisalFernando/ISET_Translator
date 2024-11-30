// Backend/index.js
import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import userWordRoutes from './routes/userWordRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('Hello');
});

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint to serve GeoJSON data
app.get('/api/geojson', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'lk.json');
    console.log(`Attempting to send file from path: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Failed to send file');
        }
    });
});

// Routes
app.use('/api', userWordRoutes);

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('App connected to the database');
        app.listen(PORT, () => {
            console.log(`App is listening on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
