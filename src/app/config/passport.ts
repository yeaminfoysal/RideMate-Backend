/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { User } from "../modules/user/user.model";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs"
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, { message: "User does not exist" });
            }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google")

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." })
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatched) {
                return done(null, false, { message: "Password does not match" })
            }

            return done(null, isUserExist)

        } catch (error) {
            console.log(error);
            done(error)
        }
    })
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      passReqToCallback: true, // req access করতে চাইলে true
    },
    // NOTE: signature has 6 params when passReqToCallback=true
    (req: any, accessToken: string, refreshToken: string, params: any, profile: Profile, done: VerifyCallback) => {
      (async () => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(null, false, { message: "No email found" });
          }
          
          let role = "USER";
          const rawState = params?.state ?? req?.query?.state;
          if (rawState) {
            try {
              const parsed = typeof rawState === "string" ? JSON.parse(rawState) : rawState;
              if (parsed?.role) role = parsed.role;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (parseErr) {
              if (typeof rawState === "string" && ["DRIVER", "RIDER", "USER"].includes(rawState)) {
                role = rawState;
              }
            }
          }

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              role,
              isVerified: true,
              auths: [
                {
                  provider: "google",
                  providerId: profile.id,
                },
              ],
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      })();
    }
  )
);


passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})