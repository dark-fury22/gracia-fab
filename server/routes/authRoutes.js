import express from 'express'
import {
  registerUser, loginUser, getUserProfile, updateUserProfile
} from '../controllers/authController.js'
import { googleLogin, facebookLogin } from '../controllers/oauthController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.post('/google', googleLogin)
router.post('/facebook', facebookLogin)

export default router