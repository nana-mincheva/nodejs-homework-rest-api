const express = require("express");
const ctrl = require("../../controllers/users");
const { validation, auth, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

router.post("/register", validation(schemas.registerSchema), ctrl.register);

router.post("/login", validation(schemas.loginSchema), ctrl.login);

router.get("/current", auth, ctrl.getCurrent);

router.get("/verify/:verificationToken", ctrl.verify);

router.post("/verify", validation(schemas.emailSchema), ctrl.resendVerifyEmail);

router.post("/logout", auth, ctrl.logout);

router.patch("/", auth, validation(schemas.updateSubscription), ctrl.updateSubscription);

router.patch("/avatars", auth, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;