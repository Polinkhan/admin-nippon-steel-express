const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const genarateToken = (userId, secret, expTime) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const option = {
      expiresIn: expTime,
      issuer: "abusayedpolin.com",
      audience: userId,
    };
    jwt.sign(payload, secret, option, (error, token) => {
      if (error) reject(createError.InternalServerError(error.message));
      resolve(token);
    });
  });
};

const signAccessToken = async (userId) =>
  await genarateToken(userId, process.env.JWT_ACCESS_TOKEN_SECRET, "1h");

const signRefreshToken = async (userId) =>
  await genarateToken(userId, process.env.JWT_REFRESH_TOKEN_SECRET, "1y");

const verifyAccessToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return next(createError.Unauthorized());
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return next(createError.Unauthorized(err.message));
    req.payload = payload;
  });
  next();
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err)
          return reject(
            createError.Unauthorized("Token has expired!! Please login again")
          );
        const userId = payload.aud;
        resolve(userId);
      }
    );
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
