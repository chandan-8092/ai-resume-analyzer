import express from 'express';
import { 
  analyzeUploadedResume, 
  getResumesHistory, 
  getResumeById, 
  downloadOriginalResume, 
  deleteResume 
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('resume'), analyzeUploadedResume);
router.get('/history', protect, getResumesHistory);
router.get('/:id', protect, getResumeById);
router.get('/:id/download', protect, downloadOriginalResume);
router.delete('/:id', protect, deleteResume);

export default router;
