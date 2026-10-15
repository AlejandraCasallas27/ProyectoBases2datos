
const sessionService = require('../services/sessionService');

async function createSession(req, res, next) {
  try {
    const user = await sessionService.createSession(req.body);

    return res.status(200).json({
      message: 'Credentials verified successfully',
      data: user
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createSession
};
