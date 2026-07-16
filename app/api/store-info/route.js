import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'store_info.json');

function readStoreInfo() {
  if (!fs.existsSync(dataFilePath)) {
    // Return empty defaults matching the frontend structure if file is missing
    return {
      about: { estd: '2003', who_we_are: '', services: '', motive: '' },
      shipping: { steps: [], damage_protection: '' },
      returns: { returns_policy: '', exchange_policy: '', warranty_policy: '' },
      faqs: []
    };
  }
  const content = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(content || '{}');
}

function writeStoreInfo(data) {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = readStoreInfo();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read store info:", error);
    return NextResponse.json({ error: "Failed to read store information." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple verification
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid data payload." }, { status: 400 });
    }
    
    writeStoreInfo(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Failed to update store info:", error);
    return NextResponse.json({ error: "Failed to update store information." }, { status: 500 });
  }
}
