// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin'); // Import firebase-admin

dotenv.config(); // Load environment variables from .env file

// Initialize Firebase Admin SDK
// You need to set up a service account key JSON file and provide its path.
// IMPORTANT: Replace './your-service-account-key.json' with the actual relative path
// and EXACT filename of the JSON file you downloaded from Firebase Project Settings > Service accounts.
// Example: If your downloaded file is named 'my-resume-builder-firebase-adminsdk-xxxxx.json'
// and it's in the same directory as server.js, the line should be:
// const serviceAccount = require('./my-resume-builder-firebase-adminsdk-xxxxx.json');
const serviceAccount = require('./resume-builder-64637-firebase-adminsdk-fbsvc-da174ddc9d.json'); // CORRECTED PATH - ENSURE THIS FILENAME MATCHES YOUR DOWNLOADED KEY

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify Firebase ID Token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach decoded token (which contains uid) to request
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Define Resume Schema and Model
const resumeSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Not unique anymore to allow multiple resumes per user
    resumeData: { // Store the entire resume data as a sub-document or embedded object
        personalDetails: {
            name: String,
            email: String,
            phone: String,
            linkedin: String,
            github: String,
            portfolio: String,
            location: String, // Added
            title: String, // Added
            profileImage: String, // Added
        },
        summary: String,
        experience: [{
            id: String, // Added 'id' to schema to match frontend's uuidv4
            title: String,
            company: String,
            location: String,
            startDate: String,
            endDate: String,
            description: [String],
        }],
        education: [{
            id: String, // Added 'id' to schema to match frontend's uuidv4
            degree: String,
            institution: String,
            location: String,
            graduationDate: String,
            gpa: String, // Added
            percentage: String, // Added
        }],
        skills: [String],
        projects: [{
            id: String, // Added 'id' to schema to match frontend's uuidv4
            name: String,
            description: String,
            link: String,
        }],
        certifications: [String],
        languages: [String],
    },
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Routes

// @route GET /api/resumes/:userId
// @desc Get all resumes for an authenticated user
app.get('/api/resumes/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        // Ensure the requested userId matches the authenticated user's uid
        if (req.user.uid !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to resumes' });
        }

        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 }); // Sort by creation date, newest first
        
        if (!resumes || resumes.length === 0) {
            return res.status(200).json({ resumes: [], message: 'No resumes found for this user.' });
        }
        
        res.status(200).json({ resumes });
    } catch (error) {
        console.error('Error fetching user resumes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route POST /api/resumes
// @desc Save/Update resume data for an authenticated user
app.post('/api/resumes', authenticateToken, async (req, res) => {
    try {
        const { _id, resumeData } = req.body; // _id will be present if updating an existing resume
        const userId = req.user.uid; // Get userId from authenticated token

        if (!resumeData) {
            return res.status(400).json({ message: 'Resume data is required.' });
        }

        let resume;
        if (_id) {
            // Attempt to find and update an existing resume by _id and userId
            resume = await Resume.findOneAndUpdate(
                { _id: _id, userId: userId },
                { resumeData: resumeData },
                { new: true, runValidators: true } // Return the updated document and run schema validators
            );

            if (!resume) {
                return res.status(404).json({ message: 'Resume not found or you do not have permission to update it.' });
            }
            res.status(200).json({ message: 'Resume updated successfully', resume });
        } else {
            // Create new resume
            resume = new Resume({
                userId,
                resumeData,
            });
            await resume.save();
            res.status(201).json({ message: 'Resume saved successfully', resume });
        }
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route DELETE /api/resumes/:id
// @desc Delete a specific resume for an authenticated user
app.delete('/api/resumes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid; // Get userId from authenticated token

        const result = await Resume.findOneAndDelete({ _id: id, userId: userId });

        if (!result) {
            return res.status(404).json({ message: 'Resume not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route POST /api/ai-suggestions
// @desc Get AI suggestions for resume improvement (authenticated)
app.post('/api/ai-suggestions', authenticateToken, async (req, res) => {
    try {
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({ message: 'Resume text is required for AI suggestions.' });
        }

        const prompt = `Review the following resume text and provide constructive suggestions for improvement. Focus on clarity, conciseness, impact, and common resume best practices. Suggest specific wording changes, additions, or removals. Format your suggestions as a bulleted list.

Resume Text:
${resumeText}

Suggestions:
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiSuggestions = response.text();

        res.json({ suggestions: aiSuggestions });

    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        res.status(500).json({ message: 'Error fetching AI suggestions' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
