const express = require("express");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { connectToMongoDB } = require("./connect");

const { checkForAuthentication, restrictTo } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const StaticRoute = require("./routes/staticRouter");
const userRoute = (require = require("./routes/user"));

const app = express();
const PORT = process.env.PORT || 8000;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() => {
  console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./view"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/user", userRoute);
app.use("/", StaticRoute);

app.get("/test", async (req, res) => {
  const allURLs = await URL.find({});
  return res.render("index", {
    urls: allURLs,
  });
});

// send a json
// {
//    url: <your_url>
// }

app.get("/url/:shortId", async (req, res) => {
  const shortID = req.params.shortId;
  const enetry = await URL.findOneAndUpdate(
    {
      ShortId: shortID,
    },
    {
      $push: {
        visitHistory: {
          timeStamp: Date.now(),
        },
      },
    }
  );

  res.redirect(enetry.redirectURL);
});

app.listen(PORT, () =>
  console.log(`Server running on https://localhost:${PORT}`)
);
