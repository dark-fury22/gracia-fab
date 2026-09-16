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
  // ───── SKINCARE (NEW — real photos pending) ─────
  {
    name: "C/M Golden Glow Intensive Whitening Exfoliating Shower Gel (1000ml)",
    description: "Exfoliating whitening shower gel that sloughs away dull, dry skin while evening out tone. Leaves skin smooth, bright and glowing after every wash.",
    price: 13000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["whitening","exfoliating","shower gel","brightening"],
    suitableFor: {"skinType":["normal","dry"],"concern":["dullness","uneven tone"]}
  },
  {
    name: "Karis Naturals Cocoa Butter Rich Nourishing Body Lotion (400ml)",
    description: "Rich cocoa butter body lotion that deeply nourishes and softens dry skin, leaving it smooth and lightly scented all day.",
    price: 4500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["cocoa butter","moisturizer","body lotion"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness"]},
    brand: "Karis Naturals"
  },
  {
    name: "Morrocan Argan Turmeric Super Whitening Oil, 7 Days SPF50",
    description: "Fast-acting whitening body oil with argan and turmeric, formulated with SPF50 to brighten skin evenly while protecting against sun-triggered dark spots.",
    price: 10000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["whitening","argan oil","turmeric","spf"],
    suitableFor: {"skinType":["all"],"concern":["uneven tone","dark spots"]}
  },
  {
    name: "Tara Vet Whitening Treatment Oil",
    description: "Targeted whitening treatment oil that fades dark patches and evens out stubborn discoloration with regular use.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["whitening","treatment oil","dark spots"],
    suitableFor: {"concern":["dark spots","uneven tone"]},
    brand: "Tara Vet"
  },
  {
    name: "Tara Vet Stretch Mark Oil (150ml, SPF50)",
    description: "Nourishing body oil with SPF50 that helps fade stretch marks and scars while keeping skin protected and hydrated.",
    price: 8000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["stretch marks","body oil","spf"],
    suitableFor: {"concern":["stretch marks","scars"]},
    brand: "Tara Vet"
  },
  {
    name: "Vaseline Intensive Care Vitamin B3 Even Tone Body Gel Oil",
    description: "Fast-absorbing body gel oil with Vitamin B3 that visibly evens skin tone and locks in moisture for softer, brighter-looking skin.",
    price: 19000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["vitamin b3","even tone","body oil"],
    suitableFor: {"concern":["uneven tone"]},
    brand: "Vaseline"
  },
  {
    name: "Active Skin Brightening Elixir Body Oil",
    description: "Lightweight brightening body oil elixir that leaves skin glowing, soft and visibly more even-toned.",
    price: 10000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["brightening","body oil","glow"],
    suitableFor: {"concern":["dullness","uneven tone"]}
  },
  {
    name: "Vaseline Intensive Care Essential Even Tone (Perfect 10)",
    description: "Everyday even-tone body lotion that moisturizes while gradually improving skin tone for a healthy, radiant look.",
    price: 3500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["even tone","moisturizer"],
    suitableFor: {"skinType":["normal","dry"],"concern":["uneven tone"]},
    brand: "Vaseline"
  },
  {
    name: "Veet Gold Collagen Restore Oil (1000ml)",
    description: "Collagen-enriched body oil that restores skin's elasticity and softness, leaving it firmer, smoother and glowing.",
    price: 12850,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["collagen","body oil","firming"],
    suitableFor: {"concern":["firmness","dryness"]},
    brand: "Veet Gold"
  },
  {
    name: "Dove Glowing Body Wash, Rice Water & Lotus Flower (500ml)",
    description: "Gentle nourishing body wash with rice water and lotus flower extract that cleanses while leaving skin soft, glowing and lightly fragranced.",
    price: 15000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["body wash","glow","rice water"],
    suitableFor: {"skinType":["all"],"concern":["dullness"]},
    brand: "Dove"
  },
  {
    name: "Advanced Korean Skin Bright & Clear Body Gel Wash (1200ml)",
    description: "Korean-formula brightening body wash that gently clears dullness and leaves skin visibly clearer and more radiant.",
    price: 15000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["brightening","body wash","korean skincare"],
    suitableFor: {"concern":["dullness","uneven tone"]}
  },
  {
    name: "Gluta White Beauty Care Face Out, Whitening Shower Bath (2000ml)",
    description: "Glutathione-infused whitening shower bath that cleanses while gradually brightening skin with every use.",
    price: 15000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["glutathione","whitening","shower bath"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    brand: "Gluta White"
  },
  {
    name: "Kuu Spa Salt Scrub Bath, Turmeric (450ml)",
    description: "Invigorating turmeric salt scrub that buffs away dead skin, unclogs pores and leaves skin soft and radiant.",
    price: 6000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["salt scrub","turmeric","exfoliating"],
    suitableFor: {"concern":["dullness","rough skin"]},
    brand: "Kuu Spa"
  },
  {
    name: "Beauty Formulas Brightening Vitamin C Co-Polishing Facial Scrub",
    description: "Gentle vitamin C facial scrub that polishes away dead skin cells and brightens complexion for a fresher, more even glow.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["vitamin c","facial scrub","brightening"],
    suitableFor: {"skinType":["normal","oily","combination"],"concern":["dullness"]},
    brand: "Beauty Formulas"
  },
  {
    name: "Cosmo Glow White Lightening Body Scrub, Carrot Oil & Kojic Acid",
    description: "Lightening body scrub with carrot oil and kojic acid that exfoliates dead skin while fading discoloration for brighter, smoother skin.",
    price: 8000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["kojic acid","body scrub","lightening"],
    suitableFor: {"concern":["uneven tone","dark spots"]},
    brand: "Cosmo Glow"
  },
  {
    name: "Veet Gold Sugar Scrub",
    description: "Fine sugar body scrub that gently exfoliates rough, dry patches, leaving skin smooth and glowing.",
    price: 7000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["sugar scrub","exfoliating","body care"],
    suitableFor: {"concern":["rough skin","dullness"]},
    brand: "Veet Gold"
  },
  {
    name: "K.Brothers Kojic Exclusive Whitening Salt Scrub",
    description: "Kojic acid salt scrub that exfoliates and brightens in one step, helping to fade dark patches over time.",
    price: 6000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["kojic acid","salt scrub","whitening"],
    suitableFor: {"concern":["dark spots","uneven tone"]},
    brand: "K.Brothers"
  },
  {
    name: "Infinity White GlowBooster Lightening Sugar Scrub",
    description: "Glow-boosting sugar scrub that lifts away dullness and dead skin, revealing a brighter, more even complexion.",
    price: 7000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["sugar scrub","lightening","glow"],
    suitableFor: {"concern":["dullness","uneven tone"]},
    brand: "Infinity White"
  },
  {
    name: "Kojic Sugar Scrub Soap (Roushun)",
    description: "2-in-1 kojic acid soap and sugar scrub that cleanses, exfoliates and gently brightens skin with daily use.",
    price: 7000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["kojic acid","scrub soap","brightening"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    brand: "Roushun"
  },
  {
    name: "Disaar Beauty VC (Vitamin C) Lotion",
    description: "Vitamin C body lotion that brightens and hydrates, helping to even out skin tone while keeping skin soft.",
    price: 5500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["vitamin c","body lotion","brightening"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    brand: "Disaar"
  },
  {
    name: "Roushun Super Whitening Body Lotion, 7 Days",
    description: "Fast-acting whitening body lotion formulated to visibly even out skin tone within days of consistent use.",
    price: 6000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["whitening","body lotion","even tone"],
    suitableFor: {"concern":["uneven tone"]},
    brand: "Roushun"
  },
  {
    name: "Disaar Natural Collagen Hand & Body Lotion",
    description: "Collagen-enriched hand and body lotion that deeply moisturizes, leaving skin soft, supple and smooth.",
    price: 5500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["collagen","moisturizer","hand and body"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness"]},
    brand: "Disaar"
  },
  {
    name: "Dove Body Love, Fairness Nourishing Care + Radiant Glow",
    description: "Nourishing body lotion that cares for skin while gradually revealing a brighter, more radiant glow.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["body lotion","glow","nourishing"],
    suitableFor: {"concern":["dullness"]},
    brand: "Dove"
  },
  {
    name: "Dove Body Love, Light Care",
    description: "Lightweight everyday body lotion that moisturizes without feeling heavy or greasy — perfect for daily use.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["body lotion","light care","moisturizer"],
    suitableFor: {"skinType":["normal","oily"],"concern":["dryness"]},
    brand: "Dove"
  },
  {
    name: "Veet Gold Kojic Acid & Amino Acid Cleansing Toner SPF15",
    description: "Kojic acid and amino acid toner with SPF15 that cleanses, brightens and protects skin in one easy step.",
    price: 4000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["kojic acid","toner","spf"],
    suitableFor: {"concern":["uneven tone"]},
    brand: "Veet Gold"
  },
  {
    name: "Dr. Rashel Vitamin C Brightening & Anti-Aging Face Serum",
    description: "Vitamin C face serum that brightens complexion and targets fine lines for a firmer, more youthful-looking glow.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["vitamin c","serum","anti-aging","brightening"],
    suitableFor: {"skinType":["normal","combination","dry"],"concern":["dullness","fine lines"]},
    brand: "Dr. Rashel"
  },
  {
    name: "Sadoer Collagen Anti-Aging Face Serum",
    description: "Collagen face serum that firms and hydrates skin, helping to reduce the look of fine lines and restore bounce.",
    price: 4000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["collagen","serum","anti-aging"],
    suitableFor: {"concern":["fine lines","aging"]},
    brand: "Sadoer"
  },
  {
    name: "Karen Paris Lightening Body Lotion (500ml)",
    description: "Everyday lightening body lotion that moisturizes while gradually evening out skin tone.",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["lightening","body lotion","even tone"],
    suitableFor: {"concern":["uneven tone"]},
    brand: "Karen Paris"
  },
  {
    name: "St. Ives Hydrating Body Lotion, Vitamin E & Avocado (621ml)",
    description: "Deeply hydrating body lotion with vitamin E and avocado that nourishes dry skin, leaving it soft and smooth for 24 hours.",
    price: 10000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["hydrating","vitamin e","avocado","moisturizer"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness"]},
    brand: "St. Ives"
  },
  // ───── SKINCARE (NEW — price unconfirmed, out of stock until reviewed) ─────
  {
    name: "Palmer's Cocoa Butter Formula Skin Therapy Oil (150ml)",
    description: "Classic cocoa butter therapy oil that deeply moisturizes and helps fade scars and stretch marks. (Estimated price — to confirm.)",
    price: 4500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["cocoa butter","body oil","scars"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness","scars"]},
    stock: 0,
    isInStock: false,
    brand: "Palmer's"
  },
  {
    name: "Disaar Turmeric Body Oil Gel (200ml)",
    description: "Turmeric-infused body oil gel that brightens and evens out skin tone with regular use. (Estimated price — to confirm.)",
    price: 8000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["turmeric","body oil","brightening"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    stock: 0,
    isInStock: false,
    brand: "Disaar"
  },
  {
    name: "Neutrogena Body Oil, Light Sesame Formula (250ml)",
    description: "Fast-absorbing light sesame body oil that hydrates without leaving a greasy residue. (Estimated price — to confirm.)",
    price: 9000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["body oil","sesame","hydrating"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness"]},
    stock: 0,
    isInStock: false,
    brand: "Neutrogena"
  },
  {
    name: "Veet Gold Alpha Arbutin Collagen Active Whitening Oil (500ml)",
    description: "Alpha arbutin and collagen whitening oil that brightens skin while improving elasticity. (Estimated price — to confirm.)",
    price: 7000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["alpha arbutin","collagen","whitening","body oil"],
    suitableFor: {"concern":["uneven tone","firmness"]},
    stock: 0,
    isInStock: false,
    brand: "Veet Gold"
  },
  {
    name: "Lemon Fresh Body Wash",
    description: "Refreshing lemon-scented body wash that cleanses and leaves skin feeling fresh. (Estimated price — to confirm.)",
    price: 3000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["body wash","lemon","cleansing"],
    suitableFor: {"skinType":["all"],"concern":[]},
    stock: 0,
    isInStock: false
  },
  {
    name: "Dr. Meinaier Shea Sugar Scrub (Orange / Coffee & Matcha)",
    description: "Exfoliating shea sugar scrub available in orange and coffee & matcha, buffing away dead skin for a smoother, brighter finish. (Estimated price — to confirm.)",
    price: 6500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["sugar scrub","shea","exfoliating"],
    suitableFor: {"concern":["rough skin","dullness"]},
    stock: 0,
    isInStock: false,
    brand: "Dr. Meinaier"
  },
  {
    name: "Infinity White Beauty Therapy Lotion SPF30",
    description: "Everyday brightening body lotion with SPF30 that evens tone while protecting against sun-triggered dark spots. (Estimated price — to confirm.)",
    price: 7500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["spf","body lotion","brightening"],
    suitableFor: {"concern":["uneven tone","sun protection"]},
    stock: 0,
    isInStock: false,
    brand: "Infinity White"
  },
  {
    name: "Face Facts Nourish + Restore Ceramide Serum",
    description: "Ceramide face serum that strengthens the skin barrier and restores moisture for softer, healthier-looking skin. (Estimated price — to confirm.)",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["ceramide","serum","barrier repair"],
    suitableFor: {"skinType":["dry","sensitive"],"concern":["dryness","barrier damage"]},
    stock: 0,
    isInStock: false,
    brand: "Face Facts"
  },
  {
    name: "Whitening Rose Water Toner",
    description: "Gentle rose water toner that refreshes and helps brighten skin as part of a daily routine. (Estimated price — to confirm.)",
    price: 4000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["toner","rose water","brightening"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    stock: 0,
    isInStock: false
  },
  {
    name: "Aichun Beauty Vitamin C Turmeric Serum (30ml)",
    description: "Vitamin C and turmeric face serum that brightens dull skin and helps fade dark spots. (Estimated price — to confirm.)",
    price: 4500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["vitamin c","turmeric","serum","brightening"],
    suitableFor: {"concern":["dark spots","dullness"]},
    stock: 0,
    isInStock: false,
    brand: "Aichun Beauty"
  },
  {
    name: "Pei Mei Hyaluronic Acid Serum",
    description: "Hydrating hyaluronic acid serum that plumps and replenishes moisture for softer, dewier skin. (Estimated price — to confirm.)",
    price: 4500,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["hyaluronic acid","serum","hydrating"],
    suitableFor: {"skinType":["dry","normal"],"concern":["dryness"]},
    stock: 0,
    isInStock: false,
    brand: "Pei Mei"
  },
  {
    name: "Almond Herbal Super White Lotion (500ml)",
    description: "Herbal whitening body lotion with almond that moisturizes while gradually evening out skin tone. (Estimated price — to confirm.)",
    price: 5000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["whitening","body lotion","almond"],
    suitableFor: {"concern":["uneven tone"]},
    stock: 0,
    isInStock: false,
    brand: "Almond Herbal"
  },
  {
    name: "Gluta Kojic Blanc+ Drip Injection Illuminateur (400ml)",
    description: "Premium glutathione and kojic acid body lotion formulated for intensive brightening and an even, illuminated glow. (Estimated price — to confirm.)",
    price: 12000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["glutathione","kojic acid","whitening","premium"],
    suitableFor: {"concern":["uneven tone","dullness"]},
    stock: 0,
    isInStock: false,
    brand: "Gluta Kojic"
  },
  {
    name: "Vaseline Intensive Care Sun Protect SPF30",
    description: "Daily moisturizing lotion with SPF30 that protects skin from sun damage while keeping it soft. (Tag price was unclear between ₦800 and ₦8,000 — estimated price to confirm.)",
    price: 4000,
    image: '/product-placeholder.svg',
    category: 'skincare',
    tags: ["spf","sun protection","body lotion"],
    suitableFor: {"concern":["sun protection"]},
    stock: 0,
    isInStock: false,
    brand: "Vaseline"
  },
  // ───── HAIRCARE (NEW — real photos pending) ─────
  {
    name: "So-fine Anti-Dandruff Darkening Cream",
    description: "Medicated anti-dandruff cream that soothes an itchy scalp, clears flakes and gradually darkens hair with regular use.",
    price: 400,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["anti-dandruff","hair cream","scalp care"],
    suitableFor: {"concern":["dandruff","itchy scalp"]},
    brand: "So-fine"
  },
  {
    name: "Apple Hair Food with Olive Oil & Protein",
    description: "Nourishing hair food enriched with olive oil and protein that strengthens strands and adds shine to dry, brittle hair.",
    price: 700,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["hair food","olive oil","protein","strengthening"],
    suitableFor: {"hairType":["all"],"concern":["dryness","breakage"]},
    brand: "Apple"
  },
  {
    name: "Soul Mate Hair Treatment",
    description: "Everyday hair care treatment for healthier-looking hair. (Label was partly obscured on the shelf photo — product name and details to confirm.)",
    price: 1100,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["hair care"],
    suitableFor: {},
    brand: "Soul Mate"
  },
  {
    name: "Davana Chebe Hair Growth Booster",
    description: "Chebe-powder hair growth booster that strengthens edges and promotes longer, healthier hair growth over time.",
    price: 1250,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["chebe","hair growth","strengthening"],
    suitableFor: {"concern":["hair growth","breakage"]},
    brand: "Davana"
  },
  {
    name: "Wilmat Hair Grow",
    description: "Hair growth treatment formulated to stimulate the scalp and encourage thicker, longer hair growth.",
    price: 1200,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["hair growth","scalp treatment"],
    suitableFor: {"concern":["hair growth","thinning"]},
    brand: "Wilmat"
  },
  {
    name: "Angel Touch Black Anti-Dandruff Hair Grower & Darkener",
    description: "2-in-1 anti-dandruff hair grower that clears flakes from the scalp while gradually darkening hair.",
    price: 1200,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["anti-dandruff","hair grower","darkener"],
    suitableFor: {"concern":["dandruff","hair growth"]},
    brand: "Angel Touch"
  },
  {
    name: "Damatol Medicated Hair, Scalp & Skin Treatment (110g)",
    description: "Medicated treatment for hair, scalp and skin that soothes irritation, clears dandruff and promotes a healthier scalp.",
    price: 1500,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["medicated","scalp treatment","anti-dandruff"],
    suitableFor: {"concern":["dandruff","scalp irritation"]},
    brand: "Damatol"
  },
  {
    name: "Damatol Medicated Hair, Scalp & Skin Treatment (Large)",
    description: "Larger size of Damatol's medicated hair, scalp and skin treatment — soothes irritation, clears dandruff and promotes a healthier scalp. (Exact size to confirm.)",
    price: 2300,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["medicated","scalp treatment","anti-dandruff"],
    suitableFor: {"concern":["dandruff","scalp irritation"]},
    brand: "Damatol"
  },
  {
    name: "Elan Aloe Vera Mentholated Shampoo/Conditioner (500ml)",
    description: "Cooling aloe vera mentholated shampoo and conditioner that cleanses the scalp and leaves hair refreshed and soft.",
    price: 1500,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["shampoo","conditioner","aloe vera","mentholated"],
    suitableFor: {"hairType":["all"],"concern":["scalp care"]},
    brand: "Elan"
  },
  {
    name: "Elan Hibiscus Mentholated Shampoo/Conditioner (500ml/250ml)",
    description: "Hibiscus-infused mentholated shampoo and conditioner that gently cleanses while cooling and soothing the scalp.",
    price: 1000,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["shampoo","conditioner","hibiscus","mentholated"],
    suitableFor: {"hairType":["all"],"concern":["scalp care"]},
    brand: "Elan"
  },
  {
    name: "Ozone Creme Relaxer, Regular (Small)",
    description: "Regular-strength creme relaxer that smooths and straightens hair while being gentle on the scalp. (Exact size to confirm.)",
    price: 1150,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["relaxer","hair straightening"],
    suitableFor: {"hairType":["coily","curly"],"concern":["texture"]},
    brand: "Ozone"
  },
  {
    name: "Ozone Creme Relaxer, Regular (Medium)",
    description: "Regular-strength creme relaxer that smooths and straightens hair while being gentle on the scalp. (Exact size to confirm.)",
    price: 1450,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["relaxer","hair straightening"],
    suitableFor: {"hairType":["coily","curly"],"concern":["texture"]},
    brand: "Ozone"
  },
  {
    name: "Ozone Creme Relaxer, Regular (Large)",
    description: "Regular-strength creme relaxer that smooths and straightens hair while being gentle on the scalp. (Exact size to confirm.)",
    price: 2300,
    image: '/product-placeholder.svg',
    category: 'haircare',
    tags: ["relaxer","hair straightening"],
    suitableFor: {"hairType":["coily","curly"],"concern":["texture"]},
    brand: "Ozone"
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