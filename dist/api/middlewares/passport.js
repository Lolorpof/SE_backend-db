"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const jobSeekerServices_1 = require("../services/jobSeekerServices");
const employerServices_1 = require("../services/employerServices");
require("../types/usersTypes");
require("../types/responseTypes");
const companyServices_1 = require("../services/companyServices");
const adminsServices_1 = require("../services/adminsServices");
// Serializer (turn into session when logging in)
passport_1.default.serializeUser(async (user, done) => {
    done(null, user);
});
// Deserializer (get user's data from session to 'req.user')
passport_1.default.deserializeUser(async (userSession, done) => {
    let responseUser;
    if (userSession.type === "JOBSEEKER" ||
        userSession.type === "OAUTHJOBSEEKER") {
        responseUser = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .deserializer(userSession.id, userSession.provider);
    }
    else if (userSession.type === "EMPLOYER" ||
        userSession.type === "OAUTHEMPLOYER") {
        responseUser = await employerServices_1.employerServices
            .instance()
            .deserializer(userSession.id, userSession.provider);
    }
    else if (userSession.type === "COMPANY") {
        responseUser = await companyServices_1.companyServices
            .instance()
            .deserializer(userSession.id);
    }
    else if (userSession.type === "ADMIN") {
        responseUser = await adminsServices_1.adminServices.instance().deserializer(userSession.id);
    }
    if (!responseUser || !responseUser.data || !responseUser.success) {
        return done("Can't fetch user", null);
    }
    const formattedUser = {
        isOauth: userSession.provider ? true : false,
        type: userSession.type,
        ...responseUser.data,
    };
    const finalUser = userSession.type !== "COMPANY" && userSession.type !== "ADMIN"
        ? formattedUser
        : { type: userSession.type, ...responseUser.data };
    done(null, finalUser);
});
// Strategies
// [Credentials]
// job seeker auth
passport_1.default.use("local-jobSeeker", new passport_local_1.Strategy({ usernameField: "nameEmail" }, jobSeekerServices_1.jobSeekerServices.instance().login));
// employer auth
passport_1.default.use("local-employer", new passport_local_1.Strategy({ usernameField: "nameEmail" }, employerServices_1.employerServices.instance().login));
// company auth
passport_1.default.use("local-company", new passport_local_1.Strategy({ usernameField: "nameEmail" }, companyServices_1.companyServices.instance().login));
// admin auth
passport_1.default.use("local-admin", new passport_local_1.Strategy({ usernameField: "nameEmail" }, adminsServices_1.adminServices.instance().login));
// [OAuth 2.0]
// <Google>
// job seeker
passport_1.default.use("google-jobSeeker", new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_JOBSEEKER_CALLBACK_URL,
    scope: ["email", "profile"],
}, jobSeekerServices_1.jobSeekerServices.instance().googleLogin));
// employer
passport_1.default.use("google-employer", new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_EMPLOYER_CALLBACK_URL,
    scope: ["email", "profile"],
}, employerServices_1.employerServices.instance().googleLogin));
exports.default = passport_1.default;
