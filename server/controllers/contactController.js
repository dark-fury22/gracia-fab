import Contact from '../models/Contact.js'

// @desc  Submit contact form
// @route POST /api/contact
export const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' })
  }

  try {
    const contact = await Contact.create({ name, email, phone, subject, message })
    console.log('📩 New contact message from:', name, email)
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon. 💌'
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
    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}