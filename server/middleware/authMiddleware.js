import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  let token

  // Check for token in headers
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {

    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Attach user to request (without password)
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' })
      }

      // Reject tokens issued before the password last changed, so a token
      // that leaked before a password reset can't keep working afterward.
      // The 1s buffer covers the same request that changes the password and
      // then immediately signs a fresh token: JWT `iat` has second-level
      // resolution and can truncate to just before passwordChangedAt's
      // millisecond value, which would otherwise reject a brand-new token.
      if (
        req.user.passwordChangedAt &&
        decoded.iat * 1000 < req.user.passwordChangedAt.getTime() - 1000
      ) {
        return res.status(401).json({ message: 'Password was changed, please log in again' })
      }

      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

export default protect