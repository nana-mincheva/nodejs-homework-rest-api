const path = require('path');
const fs = require('fs/promises');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

require("dotenv").config();
const secret = process.env.SECRET_KEY;

const register = async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    
    const avatarURL = gravatar.url(email);
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, });
     const id = newUser._id;
  const token = jwt.sign({ id }, secret, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });

  res.status(201).json({
    token,
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const email = req.body.email;
  const password  = req.body.password ;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    };

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Not authorized");
    };

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, secret, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
        token,
        email: user.email,
        subscription: user.subscription,
    })
};

const getCurrent = async (req, res) => {
  const email = req.body.email;
  const subscription = req.user.subscription;
  res.json({
    user: {
      email,
      subscription,
    },
  });
};

const logout = async (req, res) => {
  const _id = req.user._id;
    console.log(req.user);
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({
        message: "No Content"
    })
};

const updateSubscription = async (req, res) => {
  const _id = req.user._id;
  const email = req.user.email;
    const { subscription } = req.body;
    await User.findByIdAndUpdate(_id, { subscription });

    res.json({
        email,
        subscription,
    })
};

const updateAvatar = async (req, res) => {
  const _id = req.user._id;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  Jimp.read(tempUpload, async (err, ava) => {
    if (err) throw err;
    await ava.resize(250, 250).writeAsync(tempUpload);
    await fs.rename(tempUpload, resultUpload);
  });
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
};