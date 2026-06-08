import Resume from '../models/Resume.js';
import { parseResumeText } from '../services/parserService.js';
import { analyzeResume } from '../services/aiService.js';

/**
 * @desc    Upload, parse, and analyze a resume using AI
 * @route   POST /api/resumes/analyze
 * @access  Private (Auth required)
 */
export const analyzeUploadedResume = async (req, res) => {
  const { targetRole } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded.' });
  }

  if (!targetRole || targetRole.trim() === '') {
    return res.status(400).json({ message: 'Please specify a target job role for analysis.' });
  }

  try {
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    // 1. Extract text from PDF/DOCX
    console.log(`Parsing text from uploaded file: ${fileName} (${mimeType})...`);
    const extractedText = await parseResumeText(fileBuffer, mimeType);

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ message: 'We were unable to extract any readable text from the uploaded document.' });
    }

    // 2. Perform AI Analysis via Gemini
    console.log(`Analyzing resume text with Gemini AI for target role: "${targetRole}"...`);
    const analysisResult = await analyzeResume(extractedText, targetRole);

    // 3. Save resume info and analysis to Database
    const newResume = await Resume.create({
      user: req.user._id,
      fileName,
      fileData: fileBuffer,
      fileType: mimeType,
      targetRole,
      textContent: extractedText,
      analysisResult,
    });

    // Don't return the raw binary fileData in the analysis response
    const responseData = newResume.toObject();
    delete responseData.fileData;

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error during resume upload and analysis:', error);
    res.status(500).json({ message: error.message || 'An error occurred during resume analysis.' });
  }
};

/**
 * @desc    Get all resume analysis history for a user
 * @route   GET /api/resumes/history
 * @access  Private (Auth required)
 */
export const getResumesHistory = async (req, res) => {
  try {
    // Return resumes without the raw binary file data to optimize performance
    const resumes = await Resume.find({ user: req.user._id })
      .select('-fileData -textContent')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ message: 'Failed to retrieve resume analysis history.' });
  }
};

/**
 * @desc    Get detailed analysis report of a single resume
 * @route   GET /api/resumes/:id
 * @access  Private (Auth required)
 */
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume analysis report not found.' });
    }

    // Verify ownership or admin role
    if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this report.' });
    }

    // Send everything except raw fileData to save bandwidth (unless requested separately)
    const responseData = resume.toObject();
    delete responseData.fileData;

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching resume report:', error);
    res.status(500).json({ message: 'Failed to retrieve resume report.' });
  }
};

/**
 * @desc    Download the original uploaded resume file
 * @route   GET /api/resumes/:id/download
 * @access  Private (Auth required)
 */
export const downloadOriginalResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    // Verify ownership or admin role
    if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.set({
      'Content-Type': resume.fileType,
      'Content-Disposition': `attachment; filename="${resume.fileName}"`,
    });

    res.send(resume.fileData);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ message: 'Failed to download resume file.' });
  }
};

/**
 * @desc    Delete a resume report
 * @route   DELETE /api/resumes/:id
 * @access  Private (Auth required)
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume report not found.' });
    }

    // Verify ownership or admin role
    if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Cannot delete this report.' });
    }

    await resume.deleteOne();

    res.json({ message: 'Resume report successfully deleted.' });
  } catch (error) {
    console.error('Error deleting resume report:', error);
    res.status(500).json({ message: 'Failed to delete resume report.' });
  }
};
