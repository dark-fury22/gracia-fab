const products = [
  // ───── SKINCARE ─────
  {
    name: 'Glow Vitamin C Serum',
    description: 'Brightening serum with 15% Vitamin C. Reduces dark spots, evens skin tone and gives a radiant glow. Perfect for hyperpigmentation and dull skin.',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['brightening', 'vitamin c', 'serum', 'glow'],
    suitableFor: { skinType: ['oily', 'combination', 'normal'], concern: ['dark spots', 'dull skin'] },
    brand: 'GlowLab', isFeatured: true, rating: 4.5, numReviews: 12
  },
  {
    name: 'Deep Moisture Shea Cream',
    description: 'Rich, deeply hydrating cream with shea butter and hyaluronic acid. Locks in moisture for 24 hours. Great for dry and sensitive skin.',
    price: 6200,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['moisturizer', 'shea butter', 'hydrating'],
    suitableFor: { skinType: ['dry', 'sensitive', 'normal'], concern: ['dryness', 'flakiness'] },
    brand: 'NaturGlow', isFeatured: false, rating: 4.8, numReviews: 20
  },
  {
    name: 'Oil Control Mattifying Toner',
    description: 'Alcohol-free toner that controls excess oil, minimizes pores and prevents breakouts. Formulated with niacinamide and witch hazel.',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['toner', 'oil control', 'niacinamide', 'pores'],
    suitableFor: { skinType: ['oily', 'combination'], concern: ['acne', 'large pores'] },
    brand: 'ClearSkin Co.', isFeatured: true, rating: 4.3, numReviews: 8
  },
  {
    name: 'Retinol Night Renewal Serum',
    description: 'Powerful anti-aging night serum with 0.5% retinol and peptides. Reduces fine lines, firms skin and boosts cell renewal overnight.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['retinol', 'anti-aging', 'night serum', 'peptides'],
    suitableFor: { skinType: ['normal', 'combination', 'dry'], concern: ['fine lines', 'aging'] },
    brand: 'AgeDefy Pro', isFeatured: true, rating: 4.7, numReviews: 18
  },
  {
    name: 'Rose Water Hydrating Face Mist',
    description: 'Refreshing hydrating face mist with rose water, aloe vera and hyaluronic acid. Sets makeup and gives an instant glow boost throughout the day.',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['face mist', 'rose water', 'hydrating', 'setting spray'],
    suitableFor: { skinType: ['all', 'sensitive', 'dry'], concern: ['dryness', 'dullness'] },
    brand: 'PetalDew', isFeatured: false, rating: 4.6, numReviews: 14
  },
  {
    name: 'Brightening SPF 50 Sunscreen',
    description: 'Lightweight brightening sunscreen with SPF 50. Protects against UVA/UVB rays while evening skin tone. Non-greasy and perfect under makeup.',
    price: 7200,
    image: 'https://images.unsplash.com/photo-1643496740700-8ac67ef1b3de?w=500&h=600&fit=crop',
    category: 'skincare',
    tags: ['sunscreen', 'spf50', 'brightening', 'protection'],
    suitableFor: { skinType: ['all'], concern: ['sun damage', 'dark spots'] },
    brand: 'SunShield', isFeatured: true, rating: 4.9, numReviews: 35
  },
  // ───── HAIRCARE ─────
  {
    name: 'Curl Defining Cream',
    description: 'Lightweight curl cream that defines, moisturizes and reduces frizz for coily and curly hair types. Enriched with mango butter and argan oil.',
    price: 7800,
    image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=500&h=600&fit=crop',
    category: 'haircare',
    tags: ['curly hair', 'curl cream', 'frizz control'],
    suitableFor: { hairType: ['curly', 'coily'], concern: ['frizz', 'dryness'] },
    brand: 'CurlQueen', isFeatured: true, rating: 4.7, numReviews: 15
  },
  {
    name: 'Scalp Repair & Growth Oil',
    description: 'Nourishing scalp oil with castor oil, peppermint and rosemary. Stimulates hair growth, treats dandruff and strengthens hair roots.',
    price: 5900,
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=500&h=600&fit=crop',
    category: 'haircare',
    tags: ['hair growth', 'scalp oil', 'castor oil', 'rosemary'],
    suitableFor: { hairType: ['coily', 'curly', 'straight', 'wavy'], concern: ['hair loss', 'dandruff'] },
    brand: 'RootRevive', isFeatured: false, rating: 4.6, numReviews: 25
  },
  {
    name: 'Protein Bond Repair Hair Mask',
    description: 'Intensive repair hair mask with keratin, biotin and coconut oil. Restores strength, reduces breakage and leaves hair silky and shiny.',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=500&h=600&fit=crop',
    category: 'haircare',
    tags: ['hair mask', 'protein', 'keratin', 'repair'],
    suitableFor: { hairType: ['straight', 'wavy', 'curly', 'coily'], concern: ['breakage', 'damage'] },
    brand: 'BondRx', isFeatured: true, rating: 4.9, numReviews: 32
  },
  {
    name: 'Leave-In Moisture Spray',
    description: 'Lightweight leave-in conditioner spray that detangles, moisturizes and protects hair from heat damage. Works on all hair types.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&h=600&fit=crop',
    category: 'haircare',
    tags: ['leave-in', 'detangler', 'heat protection', 'moisture'],
    suitableFor: { hairType: ['all', 'curly', 'coily', 'wavy'], concern: ['tangles', 'dryness'] },
    brand: 'HydraHair', isFeatured: false, rating: 4.4, numReviews: 19
  },
  // ───── WIGS ─────
  {
    name: 'Body Wave Lace Front Wig',
    description: 'Natural looking 180% density body wave lace front wig. 24 inches, pre-plucked hairline with baby hairs. Suits oval and heart face shapes.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1522337913-f31d2e5ecca6?w=500&h=600&fit=crop',
    category: 'wig',
    tags: ['lace front', 'body wave', 'natural hair', 'long wig'],
    suitableFor: { concern: ['oval face', 'heart face', 'long length'] },
    brand: 'LuxeHair', isFeatured: true, rating: 4.9, numReviews: 30
  },
  {
    name: 'Short Kinky Afro Wig',
    description: 'Bold and beautiful short kinky afro wig. Lightweight, breathable cap construction. Perfect for round and square face shapes.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=500&h=600&fit=crop',
    category: 'wig',
    tags: ['afro', 'short wig', 'kinky', 'natural'],
    suitableFor: { concern: ['round face', 'square face', 'short length'] },
    brand: 'AfroQueen', isFeatured: false, rating: 4.4, numReviews: 18
  },
  {
    name: 'Straight Bob Lace Wig',
    description: 'Sleek and chic straight bob wig with lace closure. 12 inches, high-density natural looking hair. Great for professional and casual looks.',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=600&fit=crop',
    category: 'wig',
    tags: ['bob', 'straight', 'lace closure', 'sleek'],
    suitableFor: { concern: ['all face shapes', 'professional look'] },
    brand: 'GlamHair', isFeatured: true, rating: 4.8, numReviews: 22
  },
  {
    name: 'Deep Wave Closure Wig',
    description: 'Gorgeous deep wave wig with 4x4 closure. 20 inches, 150% density. Easy to install and style for any occasion.',
    price: 72000,
    image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=500&h=600&fit=crop',
    category: 'wig',
    tags: ['deep wave', 'closure wig', 'natural', 'wavy'],
    suitableFor: { concern: ['oval face', 'long face', 'long length'] },
    brand: 'LuxeHair', isFeatured: false, rating: 4.6, numReviews: 15
  },
  // ───── BRIDAL ─────
  {
    name: 'Bridal Glow Skincare Set',
    description: 'Complete 5-piece bridal skincare set for a flawless wedding day glow. Includes cleanser, toner, serum, moisturizer and SPF. Start 4 weeks before.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=600&fit=crop',
    category: 'bridal',
    tags: ['bridal', 'wedding', 'skincare set', 'glow'],
    suitableFor: { skinType: ['all'], concern: ['wedding prep', 'glow'] },
    brand: 'BridalGlow', isFeatured: true, rating: 5.0, numReviews: 10
  },
  {
    name: 'Bridal Frontal Wig — Silky Straight',
    description: 'Luxurious 360 frontal silky straight wig for brides. 30 inches, bleached knots, extra density. Comes with a free wig cap and adhesive.',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=600&fit=crop',
    category: 'bridal',
    tags: ['bridal wig', 'wedding hair', 'frontal', 'silky straight'],
    suitableFor: { concern: ['all face shapes', 'wedding'] },
    brand: 'LuxeHair Bridal', isFeatured: true, rating: 4.9, numReviews: 7
  },
  {
    name: 'Bridal Glam Makeup Bundle',
    description: 'All-in-one bridal makeup bundle with foundation, contour, blush, highlighter, eyeshadow palette and long-wear lipstick. Perfect for your wedding day.',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=500&h=600&fit=crop',
    category: 'bridal',
    tags: ['bridal makeup', 'wedding', 'makeup bundle', 'full glam'],
    suitableFor: { skinType: ['all'], concern: ['wedding', 'full glam'] },
    brand: 'GlamBride', isFeatured: true, rating: 4.8, numReviews: 13
  },
  {
    name: 'Pre-Wedding Glow Facial Kit',
    description: 'Professional-grade pre-wedding facial kit with enzyme mask, brightening peel and glow serum. Reveals luminous skin in just 3 sessions.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&h=600&fit=crop',
    category: 'bridal',
    tags: ['facial', 'pre-wedding', 'brightening', 'glow'],
    suitableFor: { skinType: ['all'], concern: ['brightening', 'wedding prep'] },
    brand: 'BridalGlow', isFeatured: false, rating: 4.7, numReviews: 9
  },
  {
    name: 'Bridal Signature Perfume Set',
    description: 'Elegant bridal perfume gift set with 3 signature scents — Midnight Rose, Jasmine Bloom and Pure White. Long-lasting and beautifully packaged.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&h=600&fit=crop',
    category: 'bridal',
    tags: ['perfume', 'bridal', 'gift set', 'fragrance'],
    suitableFor: { concern: ['wedding', 'gift', 'special occasion'] },
    brand: 'ScentBride', isFeatured: false, rating: 4.9, numReviews: 11
  }
]

export default products