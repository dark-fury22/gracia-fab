const products = [
  // ───── SKINCARE ─────
  {
    name: 'Beauty Formulas Glow Vitamin C Serum',
    description: 'Brightening serum with 15% Vitamin C. Reduces dark spots, evens skin tone and gives a radiant glow. Perfect for hyperpigmentation and dull skin.',
    price: 8500,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779634292/Beauty_Formulas_Vitamin_C_Serum_o7d1y6.jpg',
    category: 'skincare',
    tags: ['brightening', 'vitamin c', 'serum', 'glow'],
    suitableFor: { skinType: ['oily', 'combination', 'normal'], concern: ['dark spots', 'dull skin'] },
    brand: 'Beauty Formulas', isFeatured: true, rating: 4.5, numReviews: 12
  },
  {
    name: 'Shea Moisture Raw Shea Butter Deep Treatment',
    description: 'Rich, deeply hydrating cream with shea butter and hyaluronic acid. Locks in moisture for 24 hours. Great for dry and sensitive skin.',
    price: 6200,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779634451/Shea_Butter_Raw_mte3sa.jpg',
    category: 'skincare',
    tags: ['moisturizer', 'shea butter', 'hydrating'],
    suitableFor: { skinType: ['dry', 'sensitive', 'normal'], concern: ['dryness', 'flakiness'] },
    brand: 'Shea Moisture', isFeatured: false, rating: 4.8, numReviews: 20
  },
  {
    name: 'Oily Skin Toner – Mattifying | Natural Outcome',
    description: 'Alcohol-free toner that controls excess oil, minimizes pores and prevents breakouts. Formulated with niacinamide and witch hazel.',
    price: 5500,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779634629/Mattifying_Skin_Toner_b7z9nr.webp',
    category: 'skincare',
    tags: ['toner', 'oil control', 'niacinamide', 'pores'],
    suitableFor: { skinType: ['oily', 'combination'], concern: ['acne', 'large pores'] },
    brand: 'Natural Outcome', isFeatured: true, rating: 4.3, numReviews: 8
  },
  {
    name: 'Boost Lab Retinol Night Renewal Serum 30ml',
    description: 'Powerful anti-aging night serum with 0.5% retinol and peptides. Reduces fine lines, firms skin and boosts cell renewal overnight.',
    price: 12500,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779634770/Retinol_NIght_Serum_k1u4gi.webp',
    category: 'skincare',
    tags: ['retinol', 'anti-aging', 'night serum', 'peptides'],
    suitableFor: { skinType: ['normal', 'combination', 'dry'], concern: ['fine lines', 'aging'] },
    brand: 'Boost Lab', isFeatured: true, rating: 4.7, numReviews: 18
  },
  {
    name: 'Rose Water Hydrating Face & Body Mist',
    description: 'Refreshing hydrating face mist with rose water, aloe vera and hyaluronic acid. Sets makeup and gives an instant glow boost throughout the day.',
    price: 4800,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779634898/Rose_Water_Hydrating_Mist_w0yuyl.webp',
    category: 'skincare',
    tags: ['face mist', 'rose water', 'hydrating', 'setting spray'],
    suitableFor: { skinType: ['all', 'sensitive', 'dry'], concern: ['dryness', 'dullness'] },
    brand: 'Saltylicious', isFeatured: false, rating: 4.6, numReviews: 14
  },
  {
    name: 'Amaterasun Brightening Sunscreen SPF 50',
    description: 'Lightweight brightening sunscreen with SPF 50. Protects against UVA/UVB rays while evening skin tone. Non-greasy and perfect under makeup.',
    price: 7200,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779635060/Brightening_Sunscreen_SPF_50_hsjqtj.avif',
    category: 'skincare',
    tags: ['sunscreen', 'spf50', 'brightening', 'protection'],
    suitableFor: { skinType: ['all'], concern: ['sun damage', 'dark spots'] },
    brand: 'Amaterasun', isFeatured: true, rating: 4.9, numReviews: 35
  },
  // ───── HAIRCARE ─────
  {
    name: 'CURL UP Defining Cream | Leave In Conditioner Defines',
    description: 'Lightweight curl cream that defines, moisturizes and reduces frizz for coily and curly hair types. Enriched with mango butter and argan oil.',
    price: 7800,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779635391/Curl_Defining_Cream_nfdeua.jpg',
    category: 'haircare',
    tags: ['curly hair', 'curl cream', 'frizz control'],
    suitableFor: { hairType: ['curly', 'coily'], concern: ['frizz', 'dryness'] },
    brand: 'CURL UP', isFeatured: true, rating: 4.7, numReviews: 15
  },
  {
    name: 'Artnaturals Organic Rosemary & Castor Hair Growth Oil',
    description: 'Nourishing scalp oil with castor oil, peppermint and rosemary. Stimulates hair growth, treats dandruff and strengthens hair roots.',
    price: 5900,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779635600/Hair_Growth_Oil_l6swgg.webp',
    category: 'haircare',
    tags: ['hair growth', 'scalp oil', 'castor oil', 'rosemary'],
    suitableFor: { hairType: ['coily', 'curly', 'straight', 'wavy'], concern: ['hair loss', 'dandruff'] },
    brand: 'Artnaturals', isFeatured: false, rating: 4.6, numReviews: 25
  },
  {
    name: 'PROTEIN REPAIR HAIR MASK - Baor',
    description: 'Intensive repair hair mask with keratin, biotin and coconut oil. Restores strength, reduces breakage and leaves hair silky and shiny.',
    price: 6800,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779635792/Protein_Repair_Hair_mask_ymw7fd.webp',
    category: 'haircare',
    tags: ['hair mask', 'protein', 'keratin', 'repair'],
    suitableFor: { hairType: ['straight', 'wavy', 'curly', 'coily'], concern: ['breakage', 'damage'] },
    brand: 'Baor', isFeatured: true, rating: 4.9, numReviews: 32
  },
  {
    name: 'Nevitaly Leave-in, moisturizing spray',
    description: 'Lightweight leave-in conditioner spray that detangles, moisturizes and protects hair from heat damage. Works on all hair types.',
    price: 4500,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779635955/Leave-in_Moisturizing_Spray_fzaajl.webp',
    category: 'haircare',
    tags: ['leave-in', 'detangler', 'heat protection', 'moisture'],
    suitableFor: { hairType: ['all', 'curly', 'coily', 'wavy'], concern: ['tangles', 'dryness'] },
    brand: 'Nevitaly', isFeatured: false, rating: 4.4, numReviews: 19
  },
  // ───── WIGS ─────
  {
    name: 'Body Wave Lace Closure Wig Human Hair Wigs Pre Plucked',
    description: 'Natural looking 180% density body wave lace front wig. 24 inches, pre-plucked hairline with baby hairs. Suits oval and heart face shapes.',
    price: 85000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779636146/Body_Wave_Lace_Front_Wig_v1srla.webp',
    category: 'wig',
    tags: ['lace front', 'body wave', 'natural hair', 'long wig'],
    suitableFor: { concern: ['oval face', 'heart face', 'long length'] },
    brand: 'karLami', isFeatured: true, rating: 4.9, numReviews: 30
  },
  {
    name: 'ANNISOUL 10Inch Short Curly Afro Wigs',
    description: 'Bold and beautiful short kinky afro wig. Lightweight, breathable cap construction. Perfect for round and square face shapes.',
    price: 35000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779636306/Short_Kinky_Afro_Wig_epkjun.jpg',
    category: 'wig',
    tags: ['afro', 'short wig', 'kinky', 'natural'],
    suitableFor: { concern: ['round face', 'square face', 'short length'] },
    brand: 'ANNISOUL', isFeatured: false, rating: 4.4, numReviews: 18
  },
  {
    name: 'Brazilian Straight Bob Lace Wig With Bangs',
    description: 'Sleek and chic straight bob wig with lace closure. 12 inches, high-density natural looking hair. Great for professional and casual looks.',
    price: 55000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779636577/Straight_Bob_Lace_Wig_h0qho5.webp',
    category: 'wig',
    tags: ['bob', 'straight', 'lace closure', 'sleek'],
    suitableFor: { concern: ['all face shapes', 'professional look'] },
    brand: 'Remy Hair', isFeatured: true, rating: 4.8, numReviews: 22
  },
  {
    name: 'Loose Deep Wave Wig 13x6 HD Lace Front Human Hair Wig With Pre-plucked',
    description: 'Gorgeous deep wave wig with 4x4 closure. 20 inches, 150% density. Easy to install and style for any occasion.',
    price: 72000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779636735/Deep_Wave_Closure_Wig_uhiwjo.jpg',
    category: 'wig',
    tags: ['deep wave', 'closure wig', 'natural', 'wavy'],
    suitableFor: { concern: ['oval face', 'long face', 'long length'] },
    brand: 'WestKiss', isFeatured: false, rating: 4.6, numReviews: 15
  },
  // ───── BRIDAL ─────
  {
    name: 'VLCC Bridal Glow Facial Kit',
    description: 'Complete 5-piece bridal skincare set for a flawless wedding day glow. Includes cleanser, toner, serum, moisturizer and SPF. Start 4 weeks before.',
    price: 45000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779636885/Bridal_Glow_Skincare_Set_d2i5bc.avif',
    category: 'bridal',
    tags: ['bridal', 'wedding', 'skincare set', 'glow'],
    suitableFor: { skinType: ['all'], concern: ['wedding prep', 'glow'] },
    brand: 'VLCC', isFeatured: true, rating: 5.0, numReviews: 10
  },
  {
    name: 'Black Straight Virgin Brazilian Hair Full Lace Wig',
    description: 'Luxurious 360 frontal silky straight wig for brides. 30 inches, bleached knots, extra density. Comes with a free wig cap and adhesive.',
    price: 150000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779637483/Bridal_Frontal_Wig_Silky_Straight_i8ohbh.jpg',
    category: 'bridal',
    tags: ['bridal wig', 'wedding hair', 'frontal', 'silky straight'],
    suitableFor: { concern: ['all face shapes', 'wedding'] },
    brand: 'RiRi Hair', isFeatured: true, rating: 4.9, numReviews: 7
  },
  {
    name: 'Glamorous Beauty Bridal Kit: Glowy Wedding Makeup Set',
    description: 'All-in-one bridal makeup bundle with foundation, contour, blush, highlighter, eyeshadow palette and long-wear lipstick. Perfect for your wedding day.',
    price: 38000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779637650/Bridal_Glam_Makeup_Bundle_nuozzb.jpg',
    category: 'bridal',
    tags: ['bridal makeup', 'wedding', 'makeup bundle', 'full glam'],
    suitableFor: { skinType: ['all'], concern: ['wedding', 'full glam'] },
    brand: 'Charlotte Tilbury', isFeatured: true, rating: 4.8, numReviews: 13
  },
  {
    name: 'Aroma Magic 7 step Bridal Glow Facial Kit',
    description: 'Professional-grade pre-wedding facial kit with enzyme mask, brightening peel and glow serum. Reveals luminous skin in just 3 sessions.',
    price: 28000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779637821/Pre-Wedding_Glow_Facial_Kit_eneyiz.jpg',
    category: 'bridal',
    tags: ['facial', 'pre-wedding', 'brightening', 'glow'],
    suitableFor: { skinType: ['all'], concern: ['brightening', 'wedding prep'] },
    brand: 'Aroma Magic', isFeatured: false, rating: 4.7, numReviews: 9
  },
  {
    name: 'Mr and Mrs Engraved Perfume 30ml Refillable Black & Clear Bottle Gif',
    description: 'Elegant bridal perfume gift set with 3 signature scents — Midnight Rose, Jasmine Bloom and Pure White. Long-lasting and beautifully packaged.',
    price: 22000,
    image: 'https://res.cloudinary.com/dyzkjerez/image/upload/v1779637940/Bridal_Signature_Perfume_Set_mfg7jc.webp',
    category: 'bridal',
    tags: ['perfume', 'bridal', 'gift set', 'fragrance'],
    suitableFor: { concern: ['wedding', 'gift', 'special occasion'] },
    brand: 'Etsy', isFeatured: false, rating: 4.9, numReviews: 11
  }
]

export default products