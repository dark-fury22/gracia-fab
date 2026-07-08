import Groq from 'groq-sdk'
import Product from '../models/Product.js'

// Initialize lazily so dotenv loads first
let groqClient = null
const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}
// Scoring engine as fallback
const scoreProduct = (product, userProfile) => {
  let score = 0
  const { skinType, skinConcerns, hairType, hairConcerns, lookingFor, budget, occasion } = userProfile

  if (lookingFor?.includes('skincare') && product.category === 'skincare') score += 40
  if (lookingFor?.includes('haircare') && product.category === 'haircare') score += 40
  if (lookingFor?.includes('wig') && product.category === 'wig') score += 40
  if (lookingFor?.includes('bridal') && product.category === 'bridal') score += 40
  if (lookingFor?.includes('everything')) score += 15
  if (skinType && product.suitableFor?.skinType?.includes(skinType)) score += 25
  if (skinType && product.suitableFor?.skinType?.includes('all')) score += 15
  if (hairType && product.suitableFor?.hairType?.includes(hairType)) score += 25

  if (skinConcerns) {
    const concerns = skinConcerns.toLowerCase().split(/[,\s]+/)
    concerns.forEach(concern => {
      if (product.tags?.some(t => t.toLowerCase().includes(concern))) score += 15
      if (product.suitableFor?.concern?.some(c => c.toLowerCase().includes(concern))) score += 10
    })
  }

  if (hairConcerns) {
    const concerns = hairConcerns.toLowerCase().split(/[,\s]+/)
    concerns.forEach(concern => {
      if (product.tags?.some(t => t.toLowerCase().includes(concern))) score += 15
      if (product.suitableFor?.concern?.some(c => c.toLowerCase().includes(concern))) score += 10
    })
  }

  if (budget) {
    if (budget.includes('under 10000') && product?.price < 10000) score += 20
    if (budget.includes('10000 to 50000') && product?.price >= 10000 && product?.price <= 50000) score += 20
    if (budget.includes('50000 to 100000') && product?.price > 50000 && product?.price <= 100000) score += 20
    if (budget.includes('above 100000') && product?.price > 100000) score += 20
  }

  if (occasion?.includes('wedding') || occasion?.includes('bridal')) {
    if (product.category === 'bridal') score += 30
  }

  if (product.isFeatured) score += 10
  if (product?.rating >= 4.5) score += 10
  return score
}

const generateReason = (product, userProfile) => {
  const { skinType, hairType, skinConcerns, hairConcerns, occasion } = userProfile
  if (product.category === 'skincare') {
    if (skinConcerns) return `This is ideal for your ${skinType || ''} skin — expertly formulated to address ${skinConcerns}. Many users with similar skin profiles have seen remarkable results.`
    return `A top pick for your ${skinType || 'skin'} type. Gentle, effective and loved by thousands of Gracia Fab customers.`
  }
  if (product.category === 'haircare') {
    if (hairConcerns) return `Specially suited for ${hairType || ''} hair dealing with ${hairConcerns}. This product deeply nourishes and tackles your specific concerns.`
    return `A top pick for ${hairType || 'your'} hair type. Lightweight, effective and perfect for everyday use.`
  }
  if (product.category === 'wig') return `This stunning wig beautifully complements your style and is perfect for ${occasion || 'any occasion'}.`
  if (product.category === 'bridal') return `An absolute must-have for your special day! Curated to make you look breathtaking from the moment you walk in.`
  return `A highly rated product loved by thousands of Gracia Fab customers with a profile just like yours!`
}

const generateTip = (product) => {
  const tips = {
    skincare: [
      'Apply on freshly cleansed skin every morning and night for best results.',
      'Use consistently for at least 4 weeks to see visible improvements.',
      'Always follow with SPF during the day to protect your results.',
      'Start with a patch test if you have sensitive skin.'
    ],
    haircare: [
      'Apply to damp hair after washing for maximum absorption.',
      'Focus on the scalp and ends where your hair needs the most care.',
      'Use at least twice a week for noticeable results within a month.',
      'Seal in moisture by covering with a satin scarf overnight.'
    ],
    wig: [
      'Store on a wig stand to maintain its shape when not in use.',
      'Use a wig cap underneath for a more natural and secure fit.',
      'Detangle gently from ends to roots with a wide-tooth comb.',
      'Avoid sleeping in your wig to extend its lifespan.'
    ],
    bridal: [
      'Start your bridal skincare routine at least 4–6 weeks before your wedding day.',
      'Do a trial run with all products before the big day to avoid surprises.',
      'Keep blotting papers handy on your wedding day for a fresh look all day.',
      'Stay hydrated — it is the secret to a natural bridal glow!'
    ]
  }
  const categoryTips = tips[product.category] || tips.skincare
  return categoryTips[Math.floor(Math.random() * categoryTips.length)]
}

// @desc  Get AI beauty recommendations
// @route POST /api/recommend
export const getRecommendations = async (req, res) => {
  const { skinType, skinConcerns, hairType, hairConcerns, lookingFor, budget, occasion } = req.body

  try {
    const allProducts = await Product.find({})

    const productList = allProducts.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      brand: p.brand,
      tags: p.tags,
      suitableFor: p.suitableFor,
      description: p.description.substring(0, 120)
    }))

    const prompt = `You are Gracia Fab AI, an expert beauty advisor specializing in skincare, haircare, wigs and bridal beauty for African women.

A user has shared their beauty profile:
- Skin Type: ${skinType || 'Not specified'}
- Skin Concerns: ${skinConcerns || 'None'}
- Hair Type: ${hairType || 'Not specified'}
- Hair Concerns: ${hairConcerns || 'None'}
- Looking For: ${lookingFor || 'General recommendations'}
- Budget: ${budget || 'Any'}
- Occasion: ${occasion || 'Everyday'}

Available products:
${JSON.stringify(productList, null, 2)}

Recommend the 3 most suitable products from the list above based on the user profile.

Respond ONLY with a valid JSON object matching this structure:
{
  "recommendations": [
    {
      "productId": "the product id string",
      "reason": "warm 1-2 sentence explanation of why this suits this user",
      "tip": "practical pro beauty tip for using this product"
    }
  ]
}`

    console.log('🤖 Calling Groq AI...')

    let recommendations = null

    try {
      const completion = await getGroq().chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })

      const rawText = completion.choices[0]?.message?.content || ''
      console.log('✅ Groq responded')

      const parsed = JSON.parse(rawText.trim())
      if (parsed && Array.isArray(parsed.recommendations)) {
        recommendations = parsed.recommendations
        console.log('✅ AI recommendations parsed successfully')
      }
    } catch (aiError) {
      console.log('⚠️ Groq AI failed, using rule-based fallback:', aiError.message)
    }

    // Fallback to rule-based if AI fails
    if (!recommendations || recommendations.length === 0) {
      console.log('📊 Using rule-based recommendation engine')
      const scored = allProducts
        .map(product => ({ product, score: scoreProduct(product, { skinType, skinConcerns, hairType, hairConcerns, lookingFor, budget, occasion }) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      const results = scored.map(({ product }) => ({
        product,
        reason: generateReason(product, { skinType, hairType, skinConcerns, hairConcerns, occasion }),
        tip: generateTip(product)
      }))

      return res.json({ success: true, recommendations: results, source: 'rule-based' })
    }

    // Fetch full product details for AI recommendations
    const results = await Promise.all(
      recommendations.map(async (rec) => {
        const product = await Product.findById(rec.productId)
        if (!product) return null
        return { product, reason: rec.reason, tip: rec.tip }
      })
    )

    const validResults = results.filter(Boolean)

    // If AI returned bad IDs, fall back
    if (validResults.length === 0) {
      const scored = allProducts
        .map(product => ({ product, score: scoreProduct(product, { skinType, skinConcerns, hairType, hairConcerns, lookingFor, budget, occasion }) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      return res.json({
        success: true,
        recommendations: scored.map(({ product }) => ({
          product,
          reason: generateReason(product, { skinType, hairType, skinConcerns, hairConcerns, occasion }),
          tip: generateTip(product)
        })),
        source: 'rule-based'
      })
    }

    res.json({ success: true, recommendations: validResults, source: 'groq-ai' })

  } catch (error) {
    console.error('Recommendation error:', error.message)
    res.status(500).json({ message: 'Failed to get recommendations' })
  }
}