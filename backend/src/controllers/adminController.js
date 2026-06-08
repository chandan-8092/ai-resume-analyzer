import User from '../models/User.js';
import Resume from '../models/Resume.js';

/**
 * @desc    Get system-wide stats for Admin Panel
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();

    // Calculate average ATS Score
    const resumes = await Resume.find().select('analysisResult.atsScore');
    let avgAtsScore = 0;
    let scoreRanges = { '0-50': 0, '51-70': 0, '71-85': 0, '86-100': 0 };

    if (resumes.length > 0) {
      const totalScore = resumes.reduce((acc, curr) => {
        const score = curr.analysisResult?.atsScore || 0;
        // Increment ranges
        if (score <= 50) scoreRanges['0-50']++;
        else if (score <= 70) scoreRanges['51-70']++;
        else if (score <= 85) scoreRanges['71-85']++;
        else scoreRanges['86-100']++;

        return acc + score;
      }, 0);
      avgAtsScore = Math.round(totalScore / resumes.length);
    }

    // Top targeted roles aggregation
    const rolesAggregation = await Resume.aggregate([
      { $group: { _id: '$targetRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent activity: last 5 users & last 5 resume uploads
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const recentResumes = await Resume.find()
      .populate('user', 'name email')
      .select('-fileData -textContent')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      metrics: {
        totalUsers,
        totalResumes,
        avgAtsScore,
        scoreRanges,
        topRoles: rolesAggregation.map(r => ({ role: r._id, count: r.count }))
      },
      recentUsers,
      recentResumes
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to retrieve administrative statistics.' });
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Failed to fetch users list.' });
  }
};

/**
 * @desc    Get all resumes list
 * @route   GET /api/admin/resumes
 * @access  Private (Admin only)
 */
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate('user', 'name email')
      .select('-fileData -textContent')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    console.error('Error fetching all resumes:', error);
    res.status(500).json({ message: 'Failed to fetch uploaded resumes list.' });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection.' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent changing role of the current admin user to avoid self-locking
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own administrative role.' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated successfully to ${role}.`, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role.' });
  }
};

/**
 * @desc    Delete user and all their associated resumes
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Delete user resumes
    await Resume.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    res.json({ message: 'User and all associated resume records deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
};
