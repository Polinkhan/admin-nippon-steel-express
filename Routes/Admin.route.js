//External Imports
const express = require("express");
const createError = require("http-errors");
const router = express.Router();

//Internal Imports
const db = require("../mySQL/db_init");
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../JWT/jwt_auth");

//Routes

router.get("/", verifyAccessToken, async (req, res, next) => {
  const { aud } = req.payload;
  try {
    const [result] = await db.query(
      `SELECT * FROM adminAuth WHERE Username = ?`,
      [aud]
    );
    res.send({ user: result[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const [result] = await db.query(
      `SELECT * FROM adminAuth WHERE Username = ?`,
      [userId]
    );

    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({
      user: result[0],
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { Username, password } = req.body;
  try {
    const [result] = await db.query(
      `SELECT * FROM adminAuth WHERE Username = ?`,
      [Username]
    );
    if (result.length) {
      const { Password } = result[0];
      if (password !== Password)
        throw createError.Unauthorized("Password incorrect");
      else {
        const accessToken = await signAccessToken(Username);
        const refreshToken = await signRefreshToken(Username);
        res.send({ user: req.body, accessToken, refreshToken });
      }
    } else throw createError.BadRequest("User Not Found");
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    res.send({ status: "Logged out" });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
