const express = require("express");
const ctrl = require("../../controllers/users");
const { validation, auth } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

router.post("/register", validation(schemas.registerSchema), ctrl.register);

router.post("/login", validation(schemas.loginSchema), ctrl.login);

router.get("/current", auth, ctrl.getCurrent);

router.post("/logout", auth, ctrl.logout);

router.patch("/", auth, validation(schemas.updateSubscription), ctrl.updateSubscription);

module.exports = router;