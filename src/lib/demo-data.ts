/**
 * Demo data (used when DEMO_MODE=true)
 * English content for the storefront preview.
 */

export const DEMO_PRODUCTS = [
  {
    id: "p1",
    slug: "handmade-leather-collar",
    title: "Handmade Leather Collar",
    description:
      "Cut, stitched and finished entirely by hand from full-grain leather. Softens beautifully with wear and can be embroidered with your pet's name — a piece made to be kept for years, not seasons.",
    price: 4800,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1400",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400"
    ],
    category: "collars",

    colors: [
      { name: "Tan", hex: "#b98a5a" },
      { name: "Espresso", hex: "#43362c" },
      { name: "Cream", hex: "#efe6d5" }
    ],

    sizes: ["S", "M", "L", "XL"],
    features: [
      "Full-grain vegetable-tanned leather",
      "Hand-cut, hand-stitched and edge-burnished",
      "Solid brass hardware, engraved in-house",
      "Free personalisation — up to 12 characters",
      "Softens and deepens in colour with wear",
      "Five-point adjustable fit",
      "Width: 20 mm (S/M) · 25 mm (L/XL)"
    ],
    whyMade:
      "We wanted a collar that ages as beautifully as the bond it represents — one you keep for years, not seasons. Every piece is cut and stitched by a single maker in our workshop.",
    care:
      "Wipe with a soft dry cloth. Condition twice a year with a natural leather balm. Avoid prolonged soaking; if wet, dry away from direct heat.",
    stock: 30,
    customizable: true,
    customNote: "Personalize with up to 12 characters",
    featured: true,
    active: true
  },
  {
    id: "p2",
    slug: "cozy-knit-pet-bed",
    title: "Cozy Knit Pet Bed",
    description:
      "Hand-knit from soft, breathable cotton in a warm neutral palette. The removable cushion is machine washable, so an everyday favourite stays effortless to live with.",
    price: 8900,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1400",
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=1400"
    ],
    category: "beds",

    colors: [
      { name: "Oat", hex: "#e3d8c4" },
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Sage", hex: "#9aa98d" }
    ],

    sizes: ["Small", "Medium", "Large"],
    features: [
      "Hand-knit from breathable organic cotton",
      "Removable, machine-washable cushion",
      "Reinforced bolster edge for head support",
      "Non-slip base keeps the bed in place",
      "Naturally insulating — warm in winter, cool in summer",
      "Small: 20\" · Medium: 26\" · Large: 32\"",
      "Cushion fill: recycled polyfibre"
    ],
    whyMade:
      "We set out to knit a bed soft enough to sleep on and sturdy enough to live with — one that still looks good after a hundred washes.",
    care:
      "Remove the cushion cover and machine wash cold on a gentle cycle. Lay flat to dry. Do not tumble dry.",
    stock: 15,
    customizable: true,
    customNote: "Available in three sizes and five colours",
    featured: true,
    active: true
  },
  {
    id: "p3",
    slug: "personalized-bandana",
    title: "Personalized Bandana",
    description:
      "Made in soft cotton-linen and hand-embroidered with your pet's name. A small, everyday luxury for birthdays, celebrations and everything in between.",
    price: 2200,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=1400",
      "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=1400"
    ],
    category: "accessories",

    colors: [
      { name: "Rust", hex: "#b4552f" },
      { name: "Indigo", hex: "#3c4a6b" },
      { name: "Cream", hex: "#efe6d5" }
    ],

    sizes: ["XS", "S", "M", "L"],
    features: [
      "Soft cotton-linen blend",
      "Hand-embroidered with your pet's name",
      "Reversible, double-layer construction",
      "Two snap fastenings for a secure fit",
      "Machine washable, colours stay fast",
      "Up to 10 characters included",
      "Hand-finished rolled edges"
    ],
    whyMade:
      "A small everyday luxury for birthdays, gotcha-days and everything in between — made personal, so no two are ever the same.",
    care:
      "Machine wash cold with like colours. Tumble dry low or lay flat. Warm iron on reverse if needed — avoid the embroidery.",
    stock: 100,
    customizable: true,
    customNote: "Hand-embroidered, up to 10 characters",
    featured: true,
    active: true
  },
  {
    id: "p4",
    slug: "cat-scratcher-house",
    title: "Handmade Cat Scratcher House",
    description:
      "Built from solid wood and natural sisal, hand-finished to sit beautifully in any room. A scratcher and a hideaway in one — designed to save your sofa.",
    price: 12900,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1400",
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1400"
    ],
    category: "cat",

    colors: [
      { name: "Natural", hex: "#d9b98a" },
      { name: "Walnut", hex: "#6b4a2f" }
    ],

    sizes: ["One Size"],
    features: [
      "Solid pine frame, hand-sanded and oiled",
      "Natural sisal scratching surface",
      "Removable, replaceable sisal sleeve",
      "Hidden interior hideaway",
      "Felt base protects hard floors",
      "Assembled dimensions: 24\" H × 16\" W × 16\" D",
      "Non-toxic, pet-safe finish throughout"
    ],
    whyMade:
      "Cats need to scratch — we built something they would actually choose over your sofa, and made it handsome enough to live in the living room.",
    care:
      "Vacuum the sisal regularly. Wipe the frame with a damp cloth. Replace the sisal sleeve when it becomes frayed.",
    stock: 12,
    customizable: false,
    customNote: null,
    featured: false,
    active: true
  },
  {
    id: "p5",
    slug: "handwoven-pet-blanket",
    title: "Handwoven Pet Blanket",
    description:
      "Woven on traditional looms from a soft wool blend. Warm, breathable and endlessly versatile — for the sofa, the car, or the bed they've claimed as their own.",
    price: 5600,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=1400",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=1400"
    ],
    category: "beds",

    colors: [
      { name: "Bone", hex: "#e8e1d3" },
      { name: "Clay", hex: "#b9825f" },
      { name: "Slate", hex: "#5c6670" }
    ],

    sizes: ["Small", "Large"],
    features: [
      "Woven on traditional shuttle looms",
      "Soft wool blend with cotton warp",
      "Breathable, naturally temperature-regulating",
      "Hand-turned, fringed edges",
      "Small: 30\" × 40\" · Large: 50\" × 70\"",
      "Comes in a reusable cotton storage bag",
      "Loom-woven in small batches"
    ],
    whyMade:
      "For the sofa, the car, or the bed they have claimed as their own — a blanket woven the slow way, to be used every single day.",
    care:
      "Dry clean recommended. For small marks, spot clean with cool water and mild detergent. Lay flat to dry.",
    stock: 40,
    customizable: true,
    customNote: "Made to order in your choice of colour",
    featured: false,
    active: true
  },
  {
    id: "p6",
    slug: "ceramic-pet-bowl-set",
    title: "Ceramic Pet Bowl Set",
    description:
      "Hand-thrown stoneware, glazed in a soft matte finish. A gentle tilt makes mealtimes easier, and the weight keeps everything exactly where it should be.",
    price: 6800,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1400",
      "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=1400"
    ],
    category: "accessories",

    colors: [
      { name: "Gloss White", hex: "#f2f0eb" },
      { name: "Terracotta", hex: "#b96a4b" },
      { name: "Deep Green", hex: "#2f4a3a" }
    ],

    sizes: ["Single", "Set of 2"],
    features: [
      "Hand-thrown stoneware, no two alike",
      "Food-safe matte glaze",
      "Gentle 15° tilt eases neck strain",
      "Weighted base resists sliding",
      "Dishwasher safe",
      "Capacity: 500 ml each",
      "Lead and cadmium free"
    ],
    whyMade:
      "Mealtimes should feel considered. We threw each bowl by hand so the weight sits exactly where it should, and gave it a gentle tilt to make eating easier.",
    care:
      "Dishwasher safe on a normal cycle. Avoid thermal shock — let bowls come to room temperature before washing. Not for microwave use.",
    stock: 25,
    customizable: true,
    customNote: "Add a hand-painted name",
    featured: false,
    active: true
  }
];

/**
 * 商品评价（maxbone 详情页的评论区）。
 * 按商品 slug 覆盖；未覆盖的商品使用 DEFAULT_REVIEWS，保证每个详情页都有真实感内容。
 */
export type DemoReview = {
  rating: number;
  title: string;
  body: string;
  author: string;
  meta?: string;
  sizing?: string;
};

export const DEFAULT_REVIEWS: DemoReview[] = [
  {
    rating: 5,
    title: "Beautiful quality",
    body: "The craftsmanship is genuinely lovely — you can tell it was made by hand. It has held up perfectly through daily use and still looks brand new.",
    author: "Sarah M.",
    meta: "Verified Buyer",
    sizing: "Just Right"
  },
  {
    rating: 5,
    title: "Worth every penny",
    body: "I bought this as a gift and ended up ordering a second one for myself. The materials feel premium and the finishing is impeccable.",
    author: "Daniel K.",
    meta: "Verified Buyer",
    sizing: "Just Right"
  },
  {
    rating: 4,
    title: "Lovely, runs a touch small",
    body: "Really pleased with it overall. I would suggest sizing up if you are between sizes — otherwise, no complaints at all.",
    author: "Priya R.",
    meta: "Verified Buyer",
    sizing: "Runs Small"
  },
  {
    rating: 5,
    title: "Our dog adores it",
    body: "Easy to clean, beautifully made, and it looks far more expensive than it was. Exactly what I hoped for.",
    author: "Tom H.",
    meta: "Verified Buyer",
    sizing: "Just Right"
  }
];

/** 商品详情页 FAQ（maxbone 式：配送/退货/保养/真伪） */
export const PRODUCT_FAQ = [
  {
    q: "When will my order ship?",
    a: "Made-to-order pieces are dispatched within 2–5 business days. You will receive a tracking link by email as soon as your parcel leaves the workshop."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship worldwide to over 60 countries. Standard international delivery takes 7–10 business days. Any import duties are the responsibility of the recipient."
  },
  {
    q: "What is your return policy?",
    a: "If something is not right, you may request a return within 14 days of delivery. Items must be unworn, undamaged and unused, with their original tags attached. Personalised pieces are final sale."
  },
  {
    q: "How do I care for my piece?",
    a: "Every product page lists care instructions specific to its materials. As a rule, wash gently, avoid harsh detergents, and always lay flat to dry."
  },
  {
    q: "Is there a warranty?",
    a: "We offer a limited one-year warranty covering manufacturing defects such as stitching and hardware. It does not cover damage from chewing, misuse or normal wear."
  }
];

export const DEMO_SETTINGS: Record<string, string> = {
  "site.logoText": "Paw & Craft",
  "home.hero.title": "Pet essentials, made by hand.",
  "home.hero.subtitle":
    "We craft modern, thoughtfully designed pieces for the animals you love — small-batch, made to last, and personal to you.",
  "home.hero.image": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=2400",
  "home.hero.ctaText": "Shop the Collection",
  "home.hero.ctaLink": "/products",
  "about.story":
    "We are a small workshop of makers who love animals. From sourcing natural materials to the final hand-stitch, we treat every piece as a gift — because you and your pet deserve nothing less.",
  "footer.copyright": "© 2026 Paw & Craft. All rights reserved."
};

export const DEMO_POSTS = [
  {
    id: "b1",
    slug: "how-we-make-our-collars",
    title: "How We Make Our Handmade Collars",
    excerpt: "From hide to stitch — a look inside the workshop.",
    content:
      "Every collar begins with a single hide of full-grain leather.\nWe cut by hand, burnish the edges and seal them with wax.\nThe stitching is done with a double-needle technique for strength that lasts.\nFinally, we emboss your pet's name on the inside — their own small signature.",
    cover: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400",
    published: true,
    createdAt: new Date("2026-09-01")
  },
  {
    id: "b2",
    slug: "choosing-the-right-bed",
    title: "Choosing the Right Bed for Your Pet",
    excerpt: "Size, material, season — three things to consider.",
    content:
      "A bed is more than a place to sleep — it is a sense of safety.\nChoose a size slightly larger than your pet when curled.\nCotton works for spring and autumn; wool is best for winter.\nWhere possible, look for a removable, washable cover.",
    cover: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=1400",
    published: true,
    createdAt: new Date("2026-08-20")
  },
  {
    id: "b3",
    slug: "gift-guide-for-pet-lovers",
    title: "A Gift Guide for Pet Lovers",
    excerpt: "From personalized collars to handwoven blankets.",
    content:
      "Shopping for someone who adores their pet?\nA personalized leather collar is useful and lasting.\nA handwoven blanket warms the whole winter.\nA set of ceramic bowls brings quiet ritual to the everyday.\nAbove all — they are handmade, and they carry that warmth.",
    cover: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1400",
    published: true,
    createdAt: new Date("2026-08-05")
  }
];

export const isDemoMode = () => process.env.DEMO_MODE === "true";
