import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "change-me-please";

  // 管理员
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Owner",
      password: await bcrypt.hash(password, 10)
    }
  });

  // 站点内容
  const settings: { key: string; value: string; group: string }[] = [
    { key: "site.logoText", value: "Paw & Craft", group: "general" },
    { key: "home.hero.title", value: "Handmade, made with love for your best friend", group: "home" },
    { key: "home.hero.subtitle", value: "手工打造的宠物用品，为你的毛孩子量身定制", group: "home" },
    { key: "home.hero.image", value: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1600", group: "home" },
    { key: "home.hero.ctaText", value: "Shop Handmade", group: "home" },
    { key: "home.hero.ctaLink", value: "/products", group: "home" },
    { key: "about.story", value: "我们是一间小小的手工作坊，每一件宠物用品都由匠人亲手制作，只为你和你的毛孩子。", group: "about" },
    { key: "footer.copyright", value: "© 2026 Paw & Craft. All rights reserved.", group: "footer" }
  ];
  for (const s of settings) {
    await prisma.pageSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  // 支付网关初始化（默认关闭，后台开启）
  const gateways = [
    { gateway: "STRIPE" as const, displayName: "Credit Card (Stripe)", currencies: ["USD", "EUR", "GBP"] },
    { gateway: "PAYPAL" as const, displayName: "PayPal", currencies: ["USD", "EUR", "GBP"] },
    { gateway: "OCEANPAYMENT" as const, displayName: "钱海 Oceanpayment", currencies: ["USD", "EUR"] },
    { gateway: "WINTOPAY" as const, displayName: "Wintopay", currencies: ["USD", "EUR"] }
  ];
  for (const g of gateways) {
    await prisma.paymentConfig.upsert({ where: { gateway: g.gateway }, update: {}, create: g });
  }

  // 示例商品
  const products = [
    {
      slug: "handmade-leather-collar",
      title: "Handmade Leather Dog Collar",
      description: "头层牛皮手工缝制，可定制刻字。柔软耐用，越用越有质感。",
      price: 4800,
      images: ["https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1200"],
      category: "collars",
      stock: 30,
      customizable: true,
      customNote: "可在项圈上刻宠物名字（最多 12 字符）",
      featured: true
    },
    {
      slug: "cozy-knit-pet-bed",
      title: "Cozy Knit Pet Bed",
      description: "手工编织的治愈系宠物窝，亲肤棉线，机洗可拆。",
      price: 8900,
      images: ["https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=1200"],
      category: "beds",
      stock: 15,
      customizable: true,
      customNote: "可选颜色与尺寸",
      featured: true
    },
    {
      slug: "personalized-bandana",
      title: "Personalized Pet Bandana",
      description: "手工缝制宠物头巾，可绣名字，节日必备。",
      price: 2200,
      images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200"],
      category: "accessories",
      stock: 100,
      customizable: true,
      customNote: "可绣宠物名字",
      featured: true
    },
    {
      slug: "cat-scratcher-house",
      title: "Handmade Cat Scratcher House",
      description: "实木 + 剑麻手工猫抓屋，造型可爱，守护你的沙发。",
      price: 12900,
      images: ["https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=1200"],
      category: "cat",
      stock: 12,
      customizable: false,
      featured: false
    }
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  // 示例博客
  await prisma.post.upsert({
    where: { slug: "how-we-make-our-collars" },
    update: {},
    create: {
      slug: "how-we-make-our-collars",
      title: "How We Make Our Handmade Collars",
      excerpt: "从选皮到缝制，带你走进我们的手工工坊。",
      content: "每一根项圈都从挑选头层牛皮开始……（此处为示例内容）",
      cover: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=1200"
    }
  });

  console.log("✅ Seed 完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
