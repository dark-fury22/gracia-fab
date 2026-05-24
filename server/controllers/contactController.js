import Contact from '../models/Contact.js'
import Subscriber from '../models/Subscriber.js'

// @desc  Submit contact form
// @route POST /api/contact
export const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({
      message: 'Name, email and message are required'
    })
  }

  try {
    await Contact.create({ name, email, phone, subject, message })
    console.log('📩 New message from:', name)
    res.status(201).json({
      success: true,
      message: "Message sent! We'll get back to you within 24 hours 💌"
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Get all contact messages (admin)
// @route GET /api/contact
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Update contact status (admin)
// @route PUT /api/contact/:id
export const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!contact) return res.status(404).json({ message: 'Message not found' })
    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Delete contact message (admin)
// @route DELETE /api/contact/:id
export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id)
    res.json({ message: 'Message deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Subscribe to newsletter
// @route POST /api/contact/subscribe
export const subscribe = async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email is required' })
  }
  try {
    const existing = await Subscriber.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.json({
        success: true,
        message: "You're already subscribed! 💛 Check your inbox for updates."
      })
    }
    await Subscriber.create({ email })
    console.log('💌 New subscriber:', email)
    res.status(201).json({
      success: true,
      message: "Subscribed! Welcome to the Gracia Fab family 🌸"
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Get all subscribers (admin)
// @route GET /api/contact/subscribers
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 })
    res.json(subscribers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Delete subscriber (admin)
// @route DELETE /api/contact/subscribers/:id
export const deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id)
    res.json({ message: 'Subscriber removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}