# ResuAI - Premium AI Resume Analyzer & Interview Prep

ResuAI is a full-stack, state-of-the-art AI Resume Analyzer built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled with a gorgeous, dark/light-toggle, glassmorphic UI using **Tailwind CSS**. It enables candidates to upload resumes in PDF or DOCX format, analyze compliance against specific target job roles, view custom charts of their ATS metrics, and prepare for interviews using simulated HR & technical question sets.

---

## 🚀 Key Features

1. **User Authentication**
   - Secure register/login utilizing JSON Web Tokens (JWT).
   - Saved login state persistence.
   - Auto-elevating Admin access (e.g. using `admin@resumeeval.com` or email formats containing `admin.eval`).
2. **Text Extraction & AI Evaluation**
   - Memory-buffered file uploads (Multer) supporting PDF and DOCX parsing (`pdf-parse`, `mammoth`).
   - Deep NLP ATS optimization scanning powered by **Google Gemini AI**.
   - Custom radial dials showing final ATS Scores (0-100) and targeted job-suitability index.
3. **Skills & Keyword Analytics**
   - Extracted list of Candidate hard and soft skills.
   - Intelligent lists of missing skills compared against the targeted role.
   - Specific keyword additions list for optimizing ATS indexing.
4. **Interview Prep Simulator**
   - Technical and HR behavioral preparation questions specifically tailored to the candidate's parsed skills.
   - Accordion-reveal flashcard answers for easy self-study.
   - Quick category (Technical / HR) and difficulty (Easy, Medium, Hard) filters.
5. **Dashboard Analytics**
   - Interactive Recharts graphs showing ATS progression curves and skill category telemetry.
   - Full reports listing with search, download, and delete controls.
   - Clean, professional CSS Print Layout for instant, high-quality "Download PDF Report" actions.
6. **Administrator Console**
   - Overview metrics of system-wide users and scans database.
   - Global pie/bar charts indicating score distributions and popular career targets.
   - Elevated operations to update user permission roles, download documents, and clean records.
7. **Premium Visuals**
   - Dual theme support (Dark/Light mode) saved to local configurations.
   - Confetti celebration burst animations upon hitting high ATS score metrics.
   - Dynamic scanning checklists and step indicators during upload waiting sequences.

---

## 📁 Directory Architecture

```
AI Resume Analyzer/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB configuration using Mongoose
│   │   ├── controllers/     # Auth, Resume, and Admin controller layers
│   │   ├── middleware/      # JWT guards, Multi-role checks, Multer configuration
│   │   ├── models/          # MongoDB User & Resume database schemas
│   │   ├── routes/          # Express API route configurations
│   │   ├── services/        # PDF/DOCX parsers and Gemini AI wrappers
│   │   └── server.js        # Main Express server entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Route guards, Navbar, Sidebar, Theme selector
│   │   ├── context/         # AuthContext state provider
│   │   ├── pages/           # Dashboard, Upload, Report, Interview, Profile, Admin
│   │   ├── services/        # Axios wrapper config with interceptors
│   │   ├── App.jsx          # Router and views configuration
│   │   ├── index.css        # Tailwind directives and custom CSS styles
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── package.json             # Root concurrency launcher scripts
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18.x or later recommended)
- **MongoDB** (Local Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Step 1: Clone or Open the Workspace
Ensure both `backend` and `frontend` folders are placed in the root directory.

### Step 2: Configure Environment Variables
1. **Backend Environment**:
   Inside the `backend/` folder, create a `.env` file (copied from `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-resume-analyzer
   JWT_SECRET=super_secret_key_resume_analyzer_2026
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If `GEMINI_API_KEY` is left blank, the application will operate in **Demo Sandbox Mode**, generating simulated recruiter telemetry for testing.*

### Step 3: Install & Start Development Servers
From the **root folder**, you can run the following concurrent commands to set up the workspace:

1. **Install all dependencies** across root, backend, and frontend:
   ```bash
   npm run install-all
   ```
2. **Start both servers concurrently** (backend on `localhost:5000` & frontend on `localhost:5173`):
   ```bash
   npm run dev
   ```

---

## 🔒 Testing Sandbox Accounts

To preview features instantly without registering a new email, click the **Demo Sandbox Accounts** on the Sign In page:
- **Demo Candidate Profile**: Logs in as `user@example.com` / `password123`.
- **Demo Admin Console**: Logs in as `admin@resumeeval.com` / `password123` (Enables the Admin console link).

---

## 🚀 Deployment Instructions

### Backend Deployment (Render / Heroku)
1. Set up a Web Service on Render.
2. Select your repository, and set the root directory to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables in the Render settings:
   - `MONGODB_URI` (Use a MongoDB Atlas URI)
   - `JWT_SECRET` (A strong random string)
   - `GEMINI_API_KEY` (Your live Google Gemini API key)

### Frontend Deployment (Vercel / Netlify)
1. Deploy a static project on Vercel.
2. Set root directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. *Note: If serving on separate hosts, update the baseURL in `frontend/src/services/api.js` to point to your live backend domain instead of `http://localhost:5000`.*
