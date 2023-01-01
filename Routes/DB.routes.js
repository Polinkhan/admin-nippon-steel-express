const express = require("express");
const createError = require("http-errors");
const router = express.Router();
const db = require("../mySQL/db_init");

router.post("/getAllUserData", async (req, res, next) => {
  try {
    const [result] = await db.query(
      `SELECT * FROM usersInfo INNER JOIN userAuth ON usersInfo.UserID=userAuth.UserID`
    );
    res.send({ userData: result });
  } catch (err) {
    next(err);
  }
});

router.post("/getRecycleData", async (req, res, next) => {
  try {
    const [result] = await db.query(`SELECT * FROM recycleTable`);
    res.send({ userData: result });
  } catch (err) {
    next(err);
  }
});

router.post("/appSettingsData", async (req, res, next) => {
  try {
    const [type_result] = await db.query(`SELECT * FROM typeList`);
    const [year_result] = await db.query(`SELECT * FROM yearList`);
    const [contact_result] = await db.query(`SELECT * FROM ContactList`);
    res.send({ type_result, year_result, contact_result });
  } catch (err) {
    next(err);
  }
});

router.post("/deleteRecycleData", async (req, res, next) => {
  try {
    const { UserID } = req.body;
    const [result] = await db.query(`DELETE FROM recycleTable WHERE UserID=?`, [
      UserID,
    ]);
    res.send({ msg: { message: `Permanently Delete User ${UserID}` } });
  } catch (err) {
    next(err);
  }
});

router.post("/createUser", async (req, res, next) => {
  try {
    const { user } = req.body;
    const { UserID, Password, Email, Company, Mobile, Nationality, Type } =
      user;

    await db.query("INSERT INTO userAuth(UserID, Password) VALUES (?,?)", [
      UserID,
      Password,
    ]);

    await db.query(
      "INSERT INTO usersInfo(UserID, Company, `Date Of Birth`, `Employee Name`, `Job Title`, `Joining Date`, Nationality, Mobile, Email, Type) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        UserID,
        Company,
        user["Date Of Birth"],
        user["Employee Name"],
        user["Job Title"],
        user["Joining Date"],
        Nationality,
        Mobile,
        Email,
        Type,
      ]
    );
    res.send({ msg: { message: "Successfully Created User" } });
  } catch (err) {
    next(err);
  }
});

router.post("/updateUser", async (req, res, next) => {
  const { userData } = req.body;
  const { UserID, Email, Company, Mobile, Nationality, Type, Password } =
    userData;
  try {
    await db.query(
      "UPDATE usersInfo SET  Company = ?, `Date Of Birth` = ?, `Employee Name` = ?, `Job Title` = ?, `Joining Date` = ?, Nationality = ?, Mobile = ?, Email = ?, Type = ? WHERE UserID = ?",
      [
        Company,
        userData["Date Of Birth"],
        userData["Employee Name"],
        userData["Job Title"],
        userData["Joining Date"],
        Nationality,
        Mobile,
        Email,
        Type,
        UserID,
      ]
    );

    await db.query("UPDATE userAuth SET Password = ? WHERE UserID = ?", [
      Password,
      UserID,
    ]);

    res.send({ msg: { message: `Successfully Updated User ${UserID}` } });
  } catch (err) {
    next(err);
  }
});

router.post("/deleteUser", async (req, res, next) => {
  try {
    const { UserData } = req.body;
    const { UserID, Email, Company, Mobile, Nationality, Type, Password } =
      UserData;

    await db.query(
      "INSERT INTO recycleTable(UserID, Company, `Date Of Birth`, `Employee Name`, `Job Title`, `Joining Date`, Nationality, Mobile, Email, Type, Password) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        UserID,
        Company,
        UserData["Date Of Birth"],
        UserData["Employee Name"],
        UserData["Job Title"],
        UserData["Joining Date"],
        Nationality,
        Mobile,
        Email,
        Type,
        Password,
      ]
    );

    await db.query("DELETE FROM `userAuth` WHERE UserID=?", [UserID]);
    await db.query("DELETE FROM `usersInfo` WHERE UserID=?", [UserID]);

    res.send({ msg: { message: `Successfully Delete User ${UserID}` } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
