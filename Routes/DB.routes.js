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

router.post("/userInfo", async (req, res, next) => {
  try {
    const { ID } = req.body;
    const [result] = await db.query(
      `SELECT * FROM usersInfo WHERE UserID = ?`,
      [ID]
    );
    res.send({ currentUser: result[0] });
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
    const [MaintenanceMode] = await db.query(`SELECT * FROM AppSettings`);
    console.log(MaintenanceMode[0]);
    res.send({
      type_result,
      year_result,
      contact_result,
      ...MaintenanceMode[0],
    });
  } catch (err) {
    next(err);
  }
});

router.post("/appMaintenanceMode", async (req, res, next) => {
  try {
    const { currentMode } = req.body;
    const value = currentMode === "False" ? "True" : "False";
    await db.query("UPDATE AppSettings SET `MaintenanceMode` = ? ", [value]);
    res.send();
  } catch (err) {
    next(err);
  }
});

router.post("/payslip", async (req, res, next) => {
  try {
    const [result] = await db.query(`SELECT * FROM Payslip_Table`);
    res.send({ result });
  } catch (err) {
    next(err);
  }
});

router.post("/addtoPaysilp", async (req, res, next) => {
  const query =
    "INSERT INTO `Payslip_Table`(`ID`,`Term`, `Name`, `Basic_i`, `Offshore_i`, `Onshore_i`, `Transit_i`, `Basic_ii`, `Offshore_ii`, `Onshore_ii`,  `Transit_ii`, `OtherSalary_descr`, `OtherSalary_amount`, `CashAdvance`, `OverPay_descr`, `OverPay_amount`, `SecondaryBankAcc`, `GrandTotal`, `Deduction`, `Total`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const { data } = req.body;
  data.forEach(async (list) => {
    try {
      await db.query(query, list);
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
  res.send({ message: "Successfully add new data" });
});

router.post("/updatetoPaysilp", async (req, res, next) => {
  const query =
    "UPDATE `Payslip_Table` SET `Name`=?,`Basic_i`=?,`Offshore_i`=?,`Onshore_i`=?,`Transit_i`=?,`Basic_ii`=?,`Offshore_ii`=?,`Onshore_ii`=?,`Transit_ii`=?,`OtherSalary_descr`=?,`OtherSalary_amount`=?,`CashAdvance`=?,`OverPay_descr`=?,`OverPay_amount`=?,`SecondaryBankAcc`=?,`GrandTotal`=?,`Deduction`=?,`Total`=? WHERE `ID` = ? and `Term` = ?";
  const { data } = req.body;
  console.log(data);
  data.forEach(async (list) => {
    const [ID, Term, ...rest] = list;
    try {
      await db.query(query, [...rest, ID, Term]);
    } catch (err) {
      next(err);
    }
  });
  res.send({ message: "Successfully Updated data" });
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

router.post("/searchQuery", async (req, res, next) => {
  try {
    const { queryText } = req.body;
    console.log(queryText);
    const text = "%" + queryText + "%";
    const [result] = await db.query(
      "SELECT * FROM Payslip_Table WHERE (ID LIKE ? OR Name LIKE ? OR Term LIKE ?)",
      [text, text, text]
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post("/createUser", async (req, res, next) => {
  try {
    const { user } = req.body;
    const {
      UserID,
      Password,
      Email,
      Company,
      Mobile,
      Nationality,
      Type,
      PrimaryBankAcc,
      SecondaryBankAcc,
    } = user;

    await db.query("INSERT INTO userAuth(UserID, Password) VALUES (?,?)", [
      UserID,
      Password,
    ]);

    await db.query(
      "INSERT INTO usersInfo(UserID, Company, `Date Of Birth`, `Employee Name`, `Job Title`, `Joining Date`, Nationality, Mobile, Email, Type,PrimaryBankAcc,SecondaryBankAcc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
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
        PrimaryBankAcc,
        SecondaryBankAcc,
      ]
    );
    res.send({ msg: { message: "Successfully Created User" } });
  } catch (err) {
    next(err);
  }
});

router.post("/updateUser", async (req, res, next) => {
  const { userData } = req.body;
  const {
    UserID,
    Email,
    Company,
    Mobile,
    Nationality,
    Type,
    Password,
    PrimaryBankAcc,
    SecondaryBankAcc,
  } = userData;
  console.log(userData);
  try {
    await db.query(
      "UPDATE usersInfo SET Company = ?, `Date Of Birth` = ?, `Employee Name` = ?, `Job Title` = ?, `Joining Date` = ?, Nationality = ?, Mobile = ?, Email = ?, Type = ?, PrimaryBankAcc = ?, SecondaryBankAcc = ? WHERE UserID = ?",
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
        PrimaryBankAcc,
        SecondaryBankAcc,
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
    const {
      UserID,
      Email,
      Company,
      Mobile,
      Nationality,
      Type,
      Password,
      PrimaryBankAcc,
      SecondaryBankAcc,
    } = UserData;

    await db.query(
      "INSERT INTO recycleTable(UserID, Company, `Date Of Birth`, `Employee Name`, `Job Title`, `Joining Date`, Nationality, Mobile, Email, Type, Password,PrimaryBankAcc,SecondaryBankAcc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
        PrimaryBankAcc,
        SecondaryBankAcc,
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
