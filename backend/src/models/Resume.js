import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: Buffer,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  analysisResult: {
    type: mongoose.Schema.Types.Mixed, // Stores the detailed JSON report from Gemini
    required: true,
  },
}, {
  timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
