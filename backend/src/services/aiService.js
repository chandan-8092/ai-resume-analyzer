import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini SDK if the key is present
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is missing in your env config. Using mock resume analysis mode.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Perform AI resume analysis using Gemini 1.5 Flash.
 * Returns a standardized JSON object.
 * @param {string} resumeText - The parsed text content of the resume.
 * @param {string} targetRole - The candidate's targeted job role.
 * @returns {Promise<object>} - The structured analysis result.
 */
export const analyzeResume = async (resumeText, targetRole) => {
  const genAI = getAIClient();

  if (!genAI) {
    // Return high-quality, randomized mock data matching the required structure if no API key
    return generateMockAnalysis(targetRole);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and senior recruiter. Analyze the following resume text in detail with respect to the target job role: "${targetRole}".

Extract skills, evaluate formatting and experience, compute an ATS score, identify missing keywords/skills, and construct personalized interview prep questions (Technical and HR).

You MUST return a JSON object containing the exact structure below. Do not output any markdown code blocks, formatting, or extra text except the clean JSON.

JSON Structure:
{
  "atsScore": 85, // Integer between 0 and 100
  "isMock": false,
  "summary": "Short 2-3 sentence overview of the resume candidate's fit.",
  "jobMatchRating": 78, // Integer between 0 and 100 indicating targetRole suitability
  "extractedDetails": {
    "name": "Candidate Name or Unknown",
    "email": "Candidate Email or Unknown",
    "experience": ["List of previous companies/roles extracted"],
    "education": ["List of universities/degrees extracted"]
  },
  "skills": {
    "foundHardSkills": ["React", "Node.js", "Express", "MongoDB"],
    "foundSoftSkills": ["Communication", "Problem Solving"],
    "missingSkills": ["TypeScript", "Docker", "AWS", "CI/CD"],
    "keywordOptimization": ["RESTful API design", "NoSQL database query optimization"]
  },
  "strengthAnalysis": {
    "strengths": [
      { "category": "Experience", "score": 90, "text": "Solid backend building experience with Node.js." },
      { "category": "Skills Alignment", "score": 80, "text": "Strong matching skills list for modern fullstack positions." }
    ],
    "weaknesses": [
      { "category": "Quantification", "score": 50, "text": "Lacks numerical evidence of achievements (e.g. increased speed by X%)." },
      { "category": "Certifications", "score": 40, "text": "No cloud or DevOps certifications mentioned, which are useful for this role." }
    ],
    "overallFormatting": "Good structure, but could benefit from a dedicated technical summary block."
  },
  "improvementTips": [
    "Add metrics to project descriptions: quantify your results using percentages or dollars.",
    "Place a short summary at the top highlighting experience with the MERN stack.",
    "Add developer keywords like CI/CD, unit testing, and AWS to enhance ATS matching."
  ],
  "interviewPrep": [
    {
      "type": "technical",
      "question": "Explain the difference between SQL and MongoDB (NoSQL) indexing, and when you'd use one over the other.",
      "answer": "MongoDB uses B-Trees for standard indexes, while SQL databases utilize B-Trees or clustered indexes. MongoDB is document-based and better for horizontal scaling and rapid schema iterations, while SQL enforces strict schemas and transactions.",
      "difficulty": "medium"
    },
    {
      "type": "technical",
      "question": "What is the middleware pattern in Express.js and how does it work?",
      "answer": "Middleware functions have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. They perform operations, modify req/res, or end the request cycle.",
      "difficulty": "easy"
    },
    {
      "type": "hr",
      "question": "Tell me about a time you had a conflict with a teammate. How did you resolve it?",
      "answer": "Answer should highlight active listening, empathy, focusing on objective project goals over personal opinions, and reaching a collaborative consensus.",
      "difficulty": "easy"
    },
    {
      "type": "technical",
      "question": "Explain Docker containerization and how it fits into a local development workflow.",
      "answer": "Docker packages applications and dependencies into isolated environments. This eliminates the 'works on my machine' issue and standardizes environments across testing and production.",
      "difficulty": "hard"
    }
  ]
}

Resume Text:
"""
${resumeText}
"""
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Gemini AI API Call failed:', error);
    // If anything fails during API execution, return high quality mock results so the application behaves normally
    return generateMockAnalysis(targetRole, true);
  }
};

/**
 * Local fallback data generator.
 */
function generateMockAnalysis(targetRole, apiFailed = false) {
  const isFailed = apiFailed;
  return {
    atsScore: Math.floor(Math.random() * 20) + 65, // 65 to 85
    isMock: true,
    apiFailed: isFailed,
    summary: `Highly structured resume showing strong experience aligned with the targeted "${targetRole}" position. Demonstrates proficiency in core technologies and solid professional experience.`,
    jobMatchRating: Math.floor(Math.random() * 25) + 60, // 60 to 85
    extractedDetails: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      experience: [
        "Software Engineer Intern at Tech Corp (2025 - Present)",
        "Junior Developer at Web Builders (2024 - 2025)"
      ],
      education: [
        "Bachelor of Science in Computer Science, State University (2022 - 2026)"
      ]
    },
    skills: {
      foundHardSkills: ["JavaScript", "HTML/CSS", "React.js", "Node.js", "Express", "Git", "MongoDB"],
      foundSoftSkills: ["Collaboration", "Problem Solving", "Time Management"],
      missingSkills: getMissingSkillsForRole(targetRole),
      keywordOptimization: ["Microservices Architecture", "OAuth 2.0 Authentication", "Unit Testing (Jest)", "Agile Methodologies"]
    },
    strengthAnalysis: {
      strengths: [
        { "category": "MERN Stack Proficiency", "score": 85, "text": "Good foundation in frontend and backend JavaScript technologies." },
        { "category": "Education", "score": 90, "text": "Relevant Computer Science background." }
      ],
      weaknesses: [
        { "category": "DevOps & Cloud", "score": 45, "text": "Limited mention of cloud services (AWS/Azure) or CI/CD pipelines." },
        { "category": "Achievement Quantification", "score": 50, "text": "Resumé lists responsibilities instead of achievements." }
      ],
      overallFormatting: "Very readable, but sections could be aligned more standardly to maximize parser efficiency."
    },
    improvementTips: [
      "Include metrics (e.g., 'Improved database response times by 30% by indexing Mongoose fields').",
      "List additional cloud hosting experience (e.g. AWS, Render, Vercel).",
      "Add a professional profile statement outlining career goals at the top."
    ],
    interviewPrep: [
      {
        "type": "technical",
        "question": "What is the difference between Virtual DOM and Real DOM in React?",
        "answer": "The Virtual DOM is a lightweight, in-memory representation of the Real DOM. React uses it to compute diffs (reconciliation) and batch updates to the Real DOM, which greatly improves rendering performance.",
        "difficulty": "easy"
      },
      {
        "type": "technical",
        "question": "Explain how indexes improve database query performance in MongoDB, and what the drawbacks are.",
        "answer": "Indexes allow MongoDB to locate documents quickly without scanning the entire collection (collection scan). Drawbacks include additional write time (as indexes need updating on writes) and memory storage costs.",
        "difficulty": "medium"
      },
      {
        "type": "technical",
        "question": "Explain JavaScript event loop and asynchronous callback queues.",
        "answer": "JavaScript is single-threaded. The event loop checks the call stack, and if it's empty, pulls callbacks from the callback queue / microtask queue (like Promises) and pushes them to the stack for execution.",
        "difficulty": "hard"
      },
      {
        "type": "hr",
        "question": "Why are you interested in the role of " + targetRole + "?",
        "answer": "Express passion for the technologies used, highlight relevant projects built, and explain how the company's mission aligns with personal career progression.",
        "difficulty": "easy"
      }
    ]
  };
}

function getMissingSkillsForRole(role) {
  const normalized = role.toLowerCase();
  if (normalized.includes('frontend') || normalized.includes('react')) {
    return ["TypeScript", "Tailwind CSS", "Redux Toolkit", "Next.js", "Jest / Cypress"];
  }
  if (normalized.includes('backend') || normalized.includes('node')) {
    return ["Docker", "Redis Caching", "PostgreSQL", "AWS S3 / EC2", "CI/CD (GitHub Actions)"];
  }
  if (normalized.includes('fullstack') || normalized.includes('full stack') || normalized.includes('mern')) {
    return ["TypeScript", "Docker", "AWS deployment", "Tailwind CSS", "Unit testing with Jest"];
  }
  // Default fallback missing skills
  return ["TypeScript", "Docker", "AWS Services", "System Design", "Unit Testing", "CI/CD Pipelines"];
}
