const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const emailRegexp =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const userSchema = new Schema({
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    avatarURL: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        default: null,
    },
    verify: {
    type: Boolean,
    default: false,
    },
    verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
},
    { versionKey: false, timestamps: true });

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
    avatarURL: Joi.string().regex(/\.(jpg|jpeg|png|gif)$/i),
});

const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});

const updateSubscription = Joi.object({
    subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const schemas = {
    registerSchema,
    loginSchema,
    updateSubscription,
    emailSchema,
};

const User = model("user", userSchema);

module.exports = {
    User,
    schemas,
};