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
    res.send({ fetchedUser: result[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const [result] = await db.query(
      `SELECT * FROM adminAuth WHERE Username = ?`,
      [username]
    );
    if (result.length) {
      const { Password } = result[0];
      if (password !== Password)
        throw createError.Unauthorized("Password incorrect");
      else {
        const accessToken = await signAccessToken(username);
        const refreshToken = await signRefreshToken(username);
        res.send({ accessToken, refreshToken });
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
