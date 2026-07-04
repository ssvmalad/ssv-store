import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase config
const SUPABASE_URL = 'https://haailrysojzxfssrpsjp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IaOIGOW_AAz-0_i1QY7SdQ_V1vjC2-w';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getImageBase64(filename) {
  try {
    const filePath = path.join('D:\\ssvmalad\\dukan item photos', filename);
    const bitmap = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${bitmap.toString('base64')}`;
  } catch (e) {
    console.error(`Could not read image: ${filename}`);
    return null;
  }
}

const products = [
  {
    name: 'Kaysen Acoustic Guitar',
    category: 'String Instruments',
    sub_category: 'Acoustic',
    price: 3500,
    description: 'High-quality Kaysen acoustic guitars. Base models start at ₹3500, with premium finishes available at higher tiers.',
    image_url: getImageBase64('guitar.jpg'),
    is_available: true
  },
  {
    name: 'Premium Black Dholak',
    category: 'Percussion',
    sub_category: 'Dholak',
    price: 3500,
    description: 'Professional grade black dholak with sturdy tuning rings. Prices range from ₹3500 to ₹4500+ depending on exact size and wood density.',
    image_url: getImageBase64('black dholak.jpg'),
    is_available: true
  },
  {
    name: 'Traditional Dimdi',
    category: 'Percussion',
    sub_category: 'Dimdi',
    price: 700,
    description: 'Classic wooden Dimdi drum, perfect for bhajans and folk music accompaniment.',
    image_url: getImageBase64('dimdi (1).jpg'),
    is_available: true
  },
  {
    name: 'Standard Drum Sticks (Pair)',
    category: 'Accessories & Spares',
    sub_category: 'Sticks',
    price: 50,
    description: 'Reliable, standard wooden drum sticks for daily practice. Price is per pair.',
    image_url: getImageBase64('drum stick pair normal.jpg'),
    is_available: true
  }
];

async function insertData() {
  console.log('Inserting products into Supabase...');
  const { data, error } = await supabase.from('products').insert(products);
  
  if (error) {
    console.error('Error inserting products:', error);
  } else {
    console.log('Successfully inserted 4 products!');
  }
}

insertData();
