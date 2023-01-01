//External Imports
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
var cors = require("cors");
require("dotenv").config();

//Internal Imports
const AuthRoute = require("./Routes/Admin.route");
const DBRoute = require("./Routes/DB.routes");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  console.log("gg");
  res.send(
    `<pre>
      Admin api working...
    </pre>`
  );
});

// app.disable("etag");
app.use("/auth", AuthRoute);
app.use("/db", DBRoute);

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

// app.listen();
app.listen(5000, () => {
  console.log("listening on port 5000");
});
