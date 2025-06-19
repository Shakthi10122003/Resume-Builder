# 📄 Smart Resume Builder

A full-stack application to help users create professional resumes easily. It offers multiple templates, real-time previews, AI-powered suggestions, and PDF export functionality.

---

## 🚀 Features

- **User-Friendly Interface**  
  Intuitive forms for entering personal details, experience, education, skills, projects, certifications, and languages.

- **Multiple Resume Templates**  
  Choose from Classic, Modern Minimalist, Profile, Student templates.

- **Customizable Heading Colors**  
  Select custom colors for section headings to personalize your resume.

- **Real-Time Preview**  
  See changes instantly while you input data or switch templates.

- **🧠 AI-Powered Suggestions**  
  Uses Gemini API to suggest content improvements for clarity, impact, and formatting.

- **📄 PDF Export**  
  Download your completed resume as a polished PDF.

- **💾 Data Persistence**  
  Resume data is saved to MongoDB and tied to a unique user ID for easy future editing.

---

## 🛠 Technologies Used

### 🔹 Frontend
- **React.js** – Component-based frontend framework  
- **Tailwind CSS** – Utility-first CSS for responsive design  
- **html2pdf.js** – Convert HTML to PDF client-side  
- **uuid** – Generate unique IDs for sections/users

### 🔹 Backend
- **Node.js** – JavaScript runtime environment  
- **Express.js** – Web framework for Node.js  
- **MongoDB** – NoSQL database  
- **Mongoose** – ODM for MongoDB  
- **dotenv** – Environment variable loader  
- **cors** – Enable Cross-Origin Resource Sharing  
- **@google/generative-ai** – Connect with Gemini AI for suggestions

---

## 🧰 Setup Instructions

### 🔸 Prerequisites
- Node.js & npm ([Download Node.js](https://nodejs.org))
- MongoDB (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Gemini API key ([Get API Key](https://aistudio.google.com/app/apikey))

---

### 🔹 Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:

   ```
   PORT=5000
   MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. Start the server:

   ```bash
   npm start
   ```

   For hot-reloading in development:

   ```bash
   npm run dev
   ```

> ✅ Backend runs at `http://localhost:5000`

---

### 🔹 Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

> ✅ Frontend runs at `http://localhost:3000`

---

## 💻Usage

- **Input Your Data** – Use the forms to fill out your resume details.
- **Auto Save** – Your data is automatically stored in the database.
- **Manual Save** – Use the "Save Resume" button for manual saving.
- **Choose a Template** – Select and preview different layouts.
- **Customize Headings** – Use the palette to change heading colors.
- **AI Suggestions** – Click "Get AI Suggestions" to receive helpful feedback.
- **Export PDF** – Click "Export Resume to PDF" to download.

---

## 🤖 AI Suggestions

Powered by **Google Gemini AI**, this feature analyzes your content and provides actionable insights on:

- Language clarity  
- Resume formatting  
- Content impact  
- Industry best practices

---

> Built  by [Shakthi10122003](https://github.com/Shakthi10122003)
