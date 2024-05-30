const express = require("express");
const router = express.Router();
const User = require("../model/user-model");
const Friend = require("../model/friends-model");
const auth = require("../middleware/auth");
const { getAllFriendList } = require("../utils/utility-function");
const { restart } = require("nodemon");

router.post("/users/register", async (req, res) => {
  const user = new User(req.body);
  try {
    const saveUser = await user.save();
    // const token = await user.generateAuthToken()

    if (!saveUser) {
      return res.status(401).send("User not created!");
    }
    res.status(201).send({ user: saveUser });
  } catch (error) {
    if (error.keyValue) {
      const errorKey = Object.keys(error.keyValue)[0];
      return res.status(400).json({ msg: `${errorKey} already Exist` });
    }

    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredential(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.status(200).send({ msg: "Login Success", user, token });
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
});

router.get("/users/all-users", auth, async (req, res) => {
  const users = await User.find({});
  res.status(200).send(users);
});

router.get("/user/me", auth, (req, res) => {
  res.send(req.user);
});

router.post("/users/search", auth, async (req, res) => {
  try {
    const user = req.user;
    const searchEmail = req.body;
    if (searchEmail.email.length <= 1) {
      return res.send([]);
    }

    const searchResult = await User.find({
      $and: [
        { email: { $ne: user.email } },
        { email: { $regex: new RegExp(searchEmail.email, "i") } },
      ],
    }).lean();

    //getting user's friendlist to check is friend available among searchresult to add add friend/view profile button in client side
    const friendList = await getAllFriendList(Friend, user._id.toString());
    const result = searchResult.map((user) => {
      user.isFriend = friendList.some(
        (friend) => friend.id.toString() == user._id.toString()
      );
      return user;
    });

    if (!result) {
      return res.status(404).send({ msg: "Data not found" });
    }
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send({ msg: "Logout Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
});

router.post("/user/logout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ msg: "Logout All Success" });
  } catch (error) {
    res.status(500).send("Internal Server Error!");
  }
});

module.exports = router;
