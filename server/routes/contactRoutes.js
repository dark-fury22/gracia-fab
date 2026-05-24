import express from 'express'
import {
  submitContact,
  getContacts,
  updateContactStatus,
  deleteContact,
  subscribe,
  getSubscribers,
  deleteSubscriber
} from '../controllers/contactController.js'
import protect from '../middleware/authMiddleware.js'
import admin from '../middleware/adminMiddleware.js'

const router = express.Router()

// Public
router.post('/', submitContact)
router.post('/subscribe', subscribe)

// Admin only
router.get('/', protect, admin, getContacts)
router.put('/:id', protect, admin, updateContactStatus)
router.delete('/:id', protect, admin, deleteContact)
router.get('/subscribers', protect, admin, getSubscribers)
router.delete('/subscribers/:id', protect, admin, deleteSubscriber)

export default router