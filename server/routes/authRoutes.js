import express from 'express'
import {
  registerUser, loginUser, verifyOtp, resendOtp, getUserProfile, updateUserProfile
} from '../controllers/authController.js'
import { googleLogin, facebookLogin } from '../controllers/oauthController.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  updateProfileSchema,
  googleLoginSchema,
  facebookLoginSchema,
} from '../validators/authValidators.js'

const router = express.Router()

router.post('/register', validate(registerSchema), registerUser)
router.post('/login', validate(loginSchema), loginUser)
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp)
router.post('/resend-otp', validate(resendOtpSchema), resendOtp)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, validate(updateProfileSchema), updateUserProfile)
router.post('/google', validate(googleLoginSchema), googleLogin)
router.post('/facebook', validate(facebookLoginSchema), facebookLogin)

export default router
