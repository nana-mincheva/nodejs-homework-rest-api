const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError } = require("../helpers");

const { SECRET_KEY } = process.env;

const auth = async (req, res, next) => {
    const [bearer, token] = req.headers.authorization.split(" ");
    if (bearer !== "Bearer") {
        next(HttpError(401, "Not authorized"))
    }
    try {
        const { id } = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(id);
        if (!user || !user.token || token !== String(user.token)) {
            next(HttpError(401, "Not authorized"))
        }
        req.user = user;
        next();
    }
    catch {
        next(HttpError(401, "Not authorized"))
    }
};

module.exports = auth;
