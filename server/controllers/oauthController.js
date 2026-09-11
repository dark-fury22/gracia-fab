import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import logger from '../utils/logger.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc  Google OAuth login
// @route POST /api/auth/google
export const googleLogin = async (req, res) => {
  const { access_token: accessToken } = req.body

  try {
    if (!accessToken) {
      return res.status(400).json({ message: 'Google access token is required' })
    }

    // Verify the token was actually issued to THIS app (rejects a valid
    // Google token minted for some unrelated app/client) before trusting
    // anything about the caller's identity.
    const tokenInfo = await googleClient.getTokenInfo(accessToken)
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Google authentication failed' })
    }

    // Fetch the profile directly from Google using the verified token —
    // never trust identity fields supplied by the client itself.
    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!profileRes.ok) {
      return res.status(401).json({ message: 'Google authentication failed' })
    }
    const profile = await profileRes.json()
    const { email, name, sub: googleId, picture } = profile

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' })
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        name: name || 'Google User',
        email,
        password: `google_${googleId || Date.now()}_oauth`,
        avatar: picture || '',
        authProvider: 'google'
      })
      // Skip password hashing for social logins
      await user.save({ validateBeforeSave: false })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id)
    })

  } catch (error) {
    logger.error({ err: error }, 'Google auth error')
    res.status(401).json({ message: 'Google authentication failed' })
  }
}
// @desc  Facebook OAuth login
// @route POST /api/auth/facebook
export const facebookLogin = async (req, res) => {
  const { accessToken, userID, name } = req.body

  try {
    // Verify with Facebook
    const verifyUrl = `https://graph.facebook.com/${userID}?fields=id,name,email&access_token=${accessToken}`
    const fbRes = await fetch(verifyUrl)
    const fbData = await fbRes.json()

    if (fbData.error || fbData.id !== userID) {
      return res.status(401).json({ message: 'Facebook authentication failed' })
    }

    // Only ever trust the email Facebook itself returned for this token —
    // never a client-supplied email field, which would let anyone log in
    // as any account just by naming a different email in the request.
    const userEmail = fbData.email || `${userID}@facebook.com`

    let user = await User.findOne({ email: userEmail })

    if (!user) {
      user = await User.create({
        name: name || fbData.name,
        email: userEmail,
        password: `facebook_${userID}_${Date.now()}`,
        authProvider: 'facebook'
      })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })

  } catch (error) {
    logger.error({ err: error }, 'Facebook auth error')
    res.status(401).json({ message: 'Facebook authentication failed' })
  }
}