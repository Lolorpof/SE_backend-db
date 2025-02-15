import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { jobSeekerServices } from "../services/jobSeekerServices";
import { employerServices } from "../services/employerServices";
import "../types/usersTypes";
import "../types/responseTypes";
import { companyServices } from "../services/companyServices";
import { adminServices } from "../services/adminsServices";
import { ServicesResponse } from "../types/responseTypes";

// Serializer (turn into session when logging in)
passport.serializeUser(async (user, done) => {
  done(null, user);
});

// Deserializer (get user's data from session to 'req.user')
passport.deserializeUser(async (userSession: TUserSession, done) => {
  let responseUser:
    | ServicesResponse<TJobSeeker | TCompany | TEmployer>
    | undefined;
  if (
    userSession.type === "JOBSEEKER" ||
    userSession.type === "OAUTHJOBSEEKER"
  ) {
    responseUser = await jobSeekerServices
      .instance()
      .deserializer(userSession.id, userSession.provider);
  } else if (
    userSession.type === "EMPLOYER" ||
    userSession.type === "OAUTHEMPLOYER"
  ) {
    responseUser = await employerServices
      .instance()
      .deserializer(userSession.id, userSession.provider);
  } else if (userSession.type === "COMPANY") {
    responseUser = await companyServices
      .instance()
      .deserializer(userSession.id);
  } else if (userSession.type === "ADMIN") {
    responseUser = await adminServices.instance().deserializer(userSession.id);
  }

  if (!responseUser || !responseUser.data || !responseUser.success) {
    return done("Can't fetch user", null);
  }

  const formattedUser = {
    isOauth: userSession.provider ? true : false,
    type: userSession.type,
    ...responseUser.data,
  };

  const finalUser =
    userSession.type !== "COMPANY" && userSession.type !== "ADMIN"
      ? formattedUser
      : { type: userSession.type, ...responseUser.data };

  done(null, finalUser);
});

// Strategies

// [Credentials]
// job seeker auth
passport.use(
  "local-jobSeeker",
  new LocalStrategy(
    { usernameField: "nameEmail" },
    jobSeekerServices.instance().login
  )
);

// employer auth
passport.use(
  "local-employer",
  new LocalStrategy(
    { usernameField: "nameEmail" },
    employerServices.instance().login
  )
);

// company auth
passport.use(
  "local-company",
  new LocalStrategy(
    { usernameField: "nameEmail" },
    companyServices.instance().login
  )
);

// admin auth
passport.use(
  "local-admin",
  new LocalStrategy(
    { usernameField: "nameEmail" },
    adminServices.instance().login
  )
);

// [OAuth 2.0]
// <Google>
// job seeker
passport.use(
  "google-jobSeeker",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID as string,
      clientSecret: process.env.GOOGLE_CLIENTSECRET as string,
      callbackURL: process.env.GOOGLE_JOBSEEKER_CALLBACK_URL as string,
      scope: ["email", "profile"],
    },
    jobSeekerServices.instance().googleLogin
  )
);

// employer
passport.use(
  "google-employer",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID as string,
      clientSecret: process.env.GOOGLE_CLIENTSECRET as string,
      callbackURL: process.env.GOOGLE_EMPLOYER_CALLBACK_URL as string,
      scope: ["email", "profile"],
    },
    employerServices.instance().googleLogin
  )
);

export default passport;
