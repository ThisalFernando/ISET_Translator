// models/userWordModel.js
import mongoose from 'mongoose';

const userWordSchema = mongoose.Schema({
    word: { type: String, required: true, unique: true }, 
    associatedWords: [{
        word: { type: String, required: true }, 
        districtId: { type: String, required: true }, 
        districtName: { type: String, required: true }  
    }]
});

export const UserWord = mongoose.model('UserWord', userWordSchema);