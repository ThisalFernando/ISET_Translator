import express from 'express';
import { UserWord } from '../models/userWordModel.js';

const router = express.Router();

// 1. Create a user word with associated words
router.post('/userWords', async (req, res) => {
    const { word, associatedWords } = req.body;
    try {
        const newUserWord = new UserWord({ word, associatedWords });
        await newUserWord.save();
        res.json(newUserWord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create the word' });
    }
});

// 2. Get associated words for a user word
router.get('/userWords', async (req, res) => {
    const { word } = req.query;
    try {
        const userWord = await UserWord.findOne({ word: word });
        if (!userWord) {
            return res.status(404).json({ error: 'No user word found' });
        }
        res.json(userWord); 
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err });
    }
});

// 3. Update user word (update the main word itself)
router.put('/userWords/:userWordId', async (req, res) => {
    const { word } = req.body;  // Use "word" instead of "newWord"
    try {
        const userWord = await UserWord.findById(req.params.userWordId);
        if (!userWord) return res.status(404).json({ error: 'User word not found' });

        userWord.word = word; // Update the user word
        await userWord.save();
        res.json(userWord);
    } catch (err) {
        console.error("Error updating user word:", err);  // Log the actual error
        res.status(500).json({ error: 'Failed to update the user word' });
    }
});

// 4. Delete user word and its associated words
router.delete('/userWords/:userWordId', async (req, res) => {
    try {
        await UserWord.findByIdAndDelete(req.params.userWordId);
        res.json({ message: 'User word and its associated words deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete the user word' });
    }
});

// 5. Update an associated word for a specific district
router.put('/userWords/:userWordId/associated/:districtId', async (req, res) => {
    const { word } = req.body;  // Use "word" instead of "newAssociatedWord"
    try {
        const userWord = await UserWord.findById(req.params.userWordId);
        if (!userWord) return res.status(404).json({ error: 'User word not found' });

        // Update the associated word for the specific district
        const associatedWord = userWord.associatedWords.find(aw => aw.districtId === req.params.districtId);
        if (associatedWord) {
            associatedWord.word = word;  // Update the associated word
        } else {
            return res.status(404).json({ error: 'Associated word for the district not found' });
        }

        await userWord.save();
        res.json(userWord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update associated word' });
    }
});

// 6. Create an associated word for a specific district
router.post('/userWords/:userWordId/associated', async (req, res) => {
    const { districtId, districtName, word } = req.body;  // Add "districtName"
    try {
        const userWord = await UserWord.findById(req.params.userWordId);
        if (!userWord) return res.status(404).json({ error: 'User word not found' });

        // Check if the district already has an associated word
        const existingAssociatedWord = userWord.associatedWords.find(aw => aw.districtId === districtId);
        if (existingAssociatedWord) {
            return res.status(400).json({ error: 'Associated word for this district already exists' });
        }

        // Add the new associated word, including districtName
        userWord.associatedWords.push({ districtId, districtName, word });
        await userWord.save();
        res.json(userWord);
    } catch (err) {
        console.error("Error creating associated word:", err.message || err);  // Log detailed error
        res.status(500).json({ error: 'Failed to create associated word' });
    }
});

// 7. Delete an associated word for a specific district
router.delete('/userWords/:userWordId/associated/:districtId', async (req, res) => {
    try {
        const userWord = await UserWord.findById(req.params.userWordId);
        if (!userWord) return res.status(404).json({ error: 'User word not found' });

        // Remove the associated word for the specific district
        userWord.associatedWords = userWord.associatedWords.filter(aw => aw.districtId !== req.params.districtId);
        await userWord.save();
        res.json(userWord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete associated word' });
    }
});

export default router;
