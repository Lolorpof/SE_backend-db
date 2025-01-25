import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { jobSeekerServices } from "../services/jobSeekerServices";
import { employerServices } from "../services/employerServices";
import "../types/usersTypes";
import "../types/responseTypes";
import { companyServices } from "../services/companyServices";
import { format } from "path";

// Serializer (turn into session when logging in)
passport.serializeUser(async (user, done) => {
  done(null, user);
});

// Deserializer (get user's data from session to 'req.user')
passport.deserializeUser(async (userSession: userSessionType, done) => {
  let responseUser:
    | SerivcesResponse<jobSeekerType | companyType | employerType>
    | undefined;
  if (
    userSession.type === "JOBSEEKER" ||
    userSession.type === "OAUTHJOBSEEKER"
  ) {
    responseUser = await jobSeekerServices
      .instance()
      .deserializer(userSession.id, userSession.isOauth);
  } else if (
    userSession.type === "EMPLOYER" ||
    userSession.type === "OAUTHEMPLOYER"
  ) {
    responseUser = await employerServices
      .instance()
      .deserializer(userSession.id, userSession.isOauth);
  } else if (
    userSession.type === "COMPANY" ||
    userSession.type === "OAUTHCOMPANY"
  ) {
    responseUser = await companyServices
      .instance()
      .deserializer(userSession.id, userSession.isOauth);
  }

  if (!responseUser || !responseUser.data || !responseUser.success) {
    return done("Can't fetch user", null);
  }

  const formattedUser = {
    isOauth: userSession.isOauth,
    type: userSession.type,
    ...responseUser.data,
  };

  done(null, formattedUser);
});

// Strategies

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

export default passport;
