import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc  Google OAuth login
// @route POST /api/auth/google
export const googleLogin = async (req, res) => {
  const { email, name, sub: googleId, picture } = req.body

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
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
    console.error('Google auth error:', error.message)
    res.status(401).json({ message: 'Google authentication failed: ' + error.message })
  }
}
// @desc  Facebook OAuth login
// @route POST /api/auth/facebook
export const facebookLogin = async (req, res) => {
  const { accessToken, userID, name, email } = req.body

  try {
    // Verify with Facebook
    const verifyUrl = `https://graph.facebook.com/${userID}?fields=id,name,email&access_token=${accessToken}`
    const fbRes = await fetch(verifyUrl)
    const fbData = await fbRes.json()

    if (fbData.error || fbData.id !== userID) {
      return res.status(401).json({ message: 'Facebook authentication failed' })
    }

    const userEmail = email || `${userID}@facebook.com`

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
    console.error('Facebook auth error:', error.message)
    res.status(401).json({ message: 'Facebook authentication failed' })
  }
}