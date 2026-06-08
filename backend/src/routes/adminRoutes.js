import express from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllResumes, 
  updateUserRole, 
  deleteUser 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/resumes', protect, admin, getAllResumes);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
