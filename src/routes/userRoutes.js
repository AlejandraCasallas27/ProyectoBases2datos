const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post('/', userController.registerOwner);
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ data: { userId: req.user.userId, role: req.user.role } });
});
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.patch('/:userId/status', authenticate, authorize('admin'), userController.changeUserStatus);

module.exports = router;
