require('dotenv').config();
const mongoose = require('mongoose');
const colors = require('colors');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Translator, User } = require('./model'); // Import the models
const rateLimit = require('express-rate-limit'); // Rate limiting
const port = process.env.PORT || 3500;
const app = express();
// Connect to MongoDB
async function connectMongoose() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

connectMongoose();

// Middleware
app.use(cors()); // Use CORS to allow cross-origin requests
app.use(express.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));  // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; 
        console.log('Authenticated User ID:', req.user.id);
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// User Registration
app.post("/api/auth/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
        username, 
        password: hashedPassword,
        data: {  // Default data
            daily: { labels: ['Mon', 'Tue', 'Wed'], values: [10, 15, 7] },
            weekly: { labels: ['Week 1', 'Week 2'], values: [100, 150] },
            monthly: { labels: ['Jan', 'Feb'], values: [300, 200] },
            hourly: { labels: ['1 PM', '2 PM', '3 PM'], values: [5, 10, 15] },
        }
    });

    try {
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(400).json({ message: 'Bad Request' });
    }
});

app.post('/api/adduser', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error adding user' });
    }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    console.log('Attempting login for:', username);

    const user = await User.findOne({ username });
    if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(user.password + ' Password match result:', isMatch); // Log the result of the comparison

    if (!isMatch) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token , username});
});

// Fetch user info
app.get("/api/user", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Routes
app.get("/", (req, res) => {
    res.status(200).send("Server Online");
});

// Fetch all translator entries for authenticated user
app.get("/api/history", authenticate, async (req, res) => {
    try {
        console.log('User ID:', req.user.id); // Log the user ID
        const data = await Translator.find({ userId: req.user.id, deleted: { $ne: true } }).sort({ createdAt: -1 });
        console.log('Fetched history:', data); // Log the retrieved data
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch a single translator entry by ID (including deleted)
app.get("/api/history/:id", authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Translator.findById(id);

        if (!data) {
            return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data by ID:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch a single translator entry by ID (including deleted)
app.put("/api/history/:id", authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Translator.findById(id);

        if (!data) {
            return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data by ID:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new translator entry
app.post("/api/history", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Get the user by ID
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newEntry = {
            ...req.body,
            userId: req.user.id,
            username: user.username // Include username in the history entry
        };

        const data = await Translator.create(newEntry);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating entry:', error.message);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Update a translator entry by ID
app.put("/api/history/:id", authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedEntry = await Translator.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedEntry) {
            return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error('Error updating entry:', error.message);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Delete a translator entry by ID
app.delete("/api/history/:id", authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Translator.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
        console.error('Error deleting entry:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// update user details
app.put("/api/update/:id", authenticate, async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body; // The data to update the user

    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only fields that are provided in the request body
        if (updateData.username) user.username = updateData.username;
        if (updateData.password) {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            user.password = hashedPassword;
        }

        // Save the updated user
        const updatedUser = await user.save();
        
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Fetch all users
app.get("/api/getallusers", async (req, res) => {
    try {
        // Exclude the password field using projection (-password)
        const users = await User.find();
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Toggle favorite status
app.patch("/api/history/:id/favorite", authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const entry = await Translator.findById(id);

        if (!entry) {
            return res.status(404).json({ message: "Data not found" });
        }

        entry.isFavorite = !entry.isFavorite; // Toggle favorite status
        const updatedEntry = await entry.save();

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error('Error updating favorite status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Fetch user data by timeframe
app.get("/api/data/:username/:timeframe", authenticate, async (req, res) => {
    const { username, timeframe } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = user.data[timeframe];
        if (!userData) {
            return res.status(404).json({ message: 'Timeframe data not found' });
        }

        res.json({
            labels: userData.labels,
            values: userData.values,
        });
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Assuming you have a User model set up
app.delete('/api/deleteuser/:id', async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

app.put('/api/updateuser/:id', async (req, res) => {
    try {
        const { username, password } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, password }, { new: true });
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Endpoint to change password
app.post('/api/change-password', (req, res) => {
    const { username, newPassword } = req.body;

    // Check if username and new password are provided
    if (!username || !newPassword) {
        return res.status(400).json({ message: 'Username and new password are required.' });
    }

    // Find the user
    const user = users.find(user => user.username === username);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's password
    user.password = newPassword;
    return res.status(200).json({ message: 'Password changed successfully.' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`.cyan.underline);
});
