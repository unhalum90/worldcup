import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import FormData from "form-data";

dotenv.config();

const api = axios.create({
  baseURL: "https://api.lemonsqueezy.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const storeId = process.env.LEMONSQUEEZY_STORE_ID;

/* ---------- core helpers ---------- */

async function createProduct(city, description_en, description_es) {
  const payload = {
    data: {
      type: "products",
      attributes: {
        name: `${city} World Cup 2026 Guide`,
        slug: city.toLowerCase().replace(/\s+/g, "-"),
        status: "draft",
        description: description_en,
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
      },
    },
  };
  const res = await api.post("/products", payload);
  return res.data.data.id;
}

async function createVariant(productId, language, price, description) {
  const payload = {
    data: {
      type: "variants",
      attributes: {
        name: language,
        slug: language.toLowerCase(),
        price,
        description,
        status: "draft",
      },
      relationships: {
        product: { data: { type: "products", id: productId } },
      },
    },
  };
  const res = await api.post("/variants", payload);
  return res.data.data.id;
}

async function uploadFile(variantId, filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  const res = await axios.post(
    `https://api.lemonsqueezy.com/v1/variants/${variantId}/files`,
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        ...form.getHeaders(),
      },
    }
  );
  return res.data.data.id;
}

/* ---------- confirmation + email fields ---------- */
async function updateProductMessaging(productId, city) {
  const payload = {
    data: {
      id: productId,
      type: "products",
      attributes: {
        confirmation_title: `Your ${city} Guide Is Ready!`,
        confirmation_message: `You're all set 🎉 Your ${city} guide is ready to download. We've also emailed you a copy so you never lose it.`,
        confirmation_button_text: "Get My Guide",
        confirmation_button_link: "https://app.lemonsqueezy.com/my-orders",
        receipt_note: `Thanks for grabbing the ${city} World Cup 2026 Trip Guide! You're now part of a community of fans planning smarter, cheaper, and stress-free trips. More city guides, transport breakdowns, and planning tools are on the way.`,
        receipt_button_text: "⬇️ Download Guide",
        receipt_button_link: "https://app.lemonsqueezy.com/my-orders",
      },
    },
  };
  await api.patch(`/products/${productId}`, payload);
}

/* ---------- main ---------- */
async function run() {
  const csv = fs.readFileSync("./guides.csv");
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  for (const row of records) {
    try {
      console.log(`\n📦 Creating product for ${row.city}`);
      const productId = await createProduct(
        row.city,
        row.description_en,
        row.description_es
      );

      const variantEn = await createVariant(
        productId,
        "English",
        row.price_en,
        row.description_en
      );
      await uploadFile(variantEn, row.file_en);

      const variantEs = await createVariant(
        productId,
        "Spanish",
        row.price_es,
        row.description_es
      );
      await uploadFile(variantEs, row.file_es);

      await updateProductMessaging(productId, row.city);
      console.log(`✅ Created ${row.city} (EN+ES) and applied confirmation messages`);
    } catch (err) {
      console.error(`❌ ${row.city} failed:`, err.response?.data || err.message);
    }
  }
}

run();