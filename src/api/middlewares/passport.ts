import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Serializer (turn into session when logging in)
passport.serializeUser((user, done) => {});

// Deserializer (get user's data from session to 'req.user')
passport.deserializeUser((userSession, done) => {});

// Strategies
passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "name_email" },
    async (username, password, done) => {}
  )
);
