import passport from 'passport'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'
import * as Users from '../connectors/users'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  PUBLIC_URL,
} from '../config'

function getGoogleAvatar (profile) {
  if (profile.photos && profile.photos.length) {
    return profile.photos[0].value
  }
}

function getEmail (profile) {
  if (profile.emails && profile.emails.length) {
    return profile.emails[0].value
  }
}

export default async function () {
  const googleOptions = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${PUBLIC_URL}/auth/google/callback`,
  }

  passport.use(new GoogleStrategy(
    googleOptions,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await Users.findOrCreate({
          userId: `google-${profile.id}`,
          name: profile.displayName,
          avatar: getGoogleAvatar(profile),
          email: getEmail(profile),
          accessToken,
          refreshToken,
        })
        done(null, user)
      } catch (e) {
        done(e)
      }
    }
  ))

  passport.serializeUser(
    (user, done) => {
      done(null, user.userId)
    }
  )

  passport.deserializeUser(
    async (id, done) => {
      const user = await Users.getById(id)
      const err = !user ? new Error('User not found') : null
      done(err, user || null)
    }
  )
}
