import express from 'express'
import { getRecommendations } from '../controllers/recommendController.js'
import validate from '../middleware/validate.js'
import { recommendSchema } from '../validators/aiValidators.js'

const router = express.Router()

router.post('/', validate(recommendSchema), getRecommendations)

export default router
