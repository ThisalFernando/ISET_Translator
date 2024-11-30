const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const translatorSchema = new mongoose.Schema({
    fromText: {
        type: String,
        required: true,
    },
    toText: {
        type: String,
        required: true,
    },
    fromLang: {
        type: String,
        required: true,
    },
    toLang: {
        type: String,
        required: true,
    },
    isFavorite: { 
        type: Boolean, 
        default: false 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    data: {
        translationCounts: {
            hourly: {
                labels: { type: [String], default: Array.from({ length: 24 }, (_, i) => `${i + 1} AM`).concat('12 AM') },
                values: { type: [Number], default: Array(24).fill(0) },
            },
            daily: {
                labels: { type: [String], default: Array.from({ length: 30 }, (_, i) => (i + 1).toString()) },
                values: { type: [Number], default: Array(30).fill(0) },
            },
            weekly: {
                labels: { type: [String], default: Array.from({ length: 52 }, (_, i) => (i + 1).toString()) },
                values: { type: [Number], default: Array(52).fill(0) },
            },
            monthly: {
                labels: { type: [String], default: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
                values: { type: [Number], default: Array(12).fill(0) },
            },
        },
    },
}, { timestamps: true });

module.exports = {
    Translator: mongoose.model("Translator", translatorSchema),
    User: mongoose.model("User", userSchema)
};
