
const userService = require('../services/userService');

async function registerOwner(req, res, next) {
  try {
    const user = await userService.registerOwner(req.body);

    return res.status(201).json({
      message: 'Owner registered successfully',
      data: user
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await userService.getUsers(
      req.query.search
    );

    return res.status(200).json({
      message: 'Users retrieved successfully',
      total: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

async function changeUserStatus(req, res, next) {
  try {
    const user = await userService.changeUserStatus(
      req.user.userId,
      req.params.userId,
      req.body
    );

    return res.status(200).json({
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerOwner,
  getUsers,
  changeUserStatus
};
