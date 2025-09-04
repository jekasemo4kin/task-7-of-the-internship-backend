const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.serializeUser((user, done) => { 
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  scope: ['profile', 'email']
  //callbackURL: '/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
          }
        });
      } 
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
  //callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { facebookId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { facebookId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            facebookId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
          }
        });
      }
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));