import express from 'express'
import { submitContact, getContacts, updateContactStatus } from '../controllers/contactController.js'
import protect from '../middleware/authMiddleware.js'
import admin from '../middleware/adminMiddleware.js'

const router = express.Router()

router.post('/', submitContact)
router.get('/', protect, admin, getContacts)
router.put('/:id', protect, admin, updateContactStatus)

export default router