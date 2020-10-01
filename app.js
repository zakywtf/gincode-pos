const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cron = require("node-cron");
const chalk = require("chalk");
// const deadlineCheck = require("./middlewares/deadlineCheck");
require("dotenv").config();


const routes = require("./routes");
const apiResponse = require("./helpers/apiResponse");

const app = express();

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Mongoose Connection
 * ! •••••••••••••••••••••••••••••••
 */
let MONGODB_URL = process.env.MONGODB_URL;

mongoose.Promise = global.Promise;
mongoose
  .connect(MONGODB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    if (process.env.NODE_ENV == "development") {
      console.log("%s Connected to", chalk.green("✓"), MONGODB_URL);
      console.log("Press CTRL + C to stop the process\n");
    }
  })
  .catch(err => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });

mongoose.set("debug", process.env.NODE_ENV == "development" ? true : false);

// Development Log
if (process.env.NODE_ENV != "development") {
  app.use(logger("combined"));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enabling and allow CORS for all requests
app.use(cors());

// Adding Helmet to enhance API's security
app.use(helmet());
app.use(
  helmet.hidePoweredBy({
    setTo: "Skynet Server 2.0.93"
  })
);

// •••••••••••••• FavIcon •••••••••••••••••
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

//Route Setup
app.use("/", routes);

//CRON Job 
//0 0 0 * * * -> every midnight
//* * * * *   -> every minute
// cron.schedule("0 0 0 * * *", async function() {
//     await deadlineCheck();
// });

// throw 404 if URL not found
app.all("*", function(req, res) {
  return apiResponse.notFoundResponse(res, "Url/Page not found");
});

// error handler
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  } else {
    return apiResponse.ErrorResponseWithData(res, "Server Error", err.message);
  }
});

if (process.env.NODE_ENV == "development") {
  app.listen(app.get("port"), () => {
    console.log(
      "%s App is starting at http://localhost:%d in %s mode, please wait for DB to connect",
      chalk.green("✓"),
      app.get("port"),
      app.get("env")
    );
  });
}

module.exports = app;
