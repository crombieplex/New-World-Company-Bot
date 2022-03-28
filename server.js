require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var ObjectId = require("mongodb").ObjectID;
const app = express();
const userModel = require("./Schemas/userSchema");
const withdrawalSchema = require("./Schemas/withdrawalSchema");

const uri = process.env.MONGODB_PRODUCTION_URL;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
mongoose.set("returnOriginal", false);

module.exports = connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
const db = mongoose.connection;

app.post("/withdrawals", async (req, res) => {
  let user = req.body.name;
  let id = req.body.discordId;
  let withdrawal = req.body.withdrawalAmount;
  let approvedWithdrawal = req.body.approved;
  let messageId = req.body.messageId;

  let userWithdrawal = new withdrawalSchema({
    name: user,
    discordId: id,
    withdrawalAmount: withdrawal,
    approved: approvedWithdrawal,
    messageId: messageId,
  });

  await userWithdrawal.save((err, user) => {
    if (err) console.log(err);
    else
      res.status(201).send({
        message: "Withdrawal posted!",
        user: user.name,
        withdrawal: user.withdrawalAmount,
      });
  });
});

app.post("/withdrawaltotals", async (req, res) => {
  userModel.find({ discordId: req.body.id }, function (err, data) {
    if (err) console.log("error");
    else if (!data.length) {
      res.status(404).send({ message: "User has not withdrawn from the company!" });
    } else {
      return res.status(201).send(data);
    }
  });
});

app.get("/withdrawalleaderboard", async (req, res) => {
  const leaders = {};
  userModel.find({}, function (err, users) {
    if (err) {
      console.log(err);
    } else {
      users.forEach((user) => {
        leaders[user.name] = user.totalWithdrawn;
      });
    }

    res.status(201).json(leaders);
  });
});

app.post("/approved", async (req, res) => {
  let messageId = req.body.messageId;

  try {
    let withdrawalUpdate = await withdrawalSchema.findOne({ messageId: messageId });

    let discordUser = new userModel({
      name: withdrawalUpdate.name,
      discordId: withdrawalUpdate.discordId,
      totalWithdrawn: withdrawalUpdate.withdrawalAmount,
    });
    userModel.exists(
      { discordId: withdrawalUpdate.discordId },
      async function (err, result) {
        if (err) {
          res.send(err);
          console.log(err);
        }
        if (result === false || result === null) {
          await discordUser.save((err, user) => {
            if (err) console.log(err);
          });
        } else {
          let user = await userModel.findOne({
            discordId: withdrawalUpdate.discordId,
          });
          withdrawalUpdate.approved = true;
          withdrawalUpdate.save();
          user.totalWithdrawn += withdrawalUpdate.withdrawalAmount;
          user.save();
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.listen(3001);
