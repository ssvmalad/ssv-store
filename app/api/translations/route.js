import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'translations.json');

function readTranslations() {
  if (!fs.existsSync(dataFilePath)) {
    return null;
  }
  const content = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(content || '{}');
}

function writeTranslations(data) {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = readTranslations();
    if (!data) {
      // If translations file does not exist, import from the static lib/translations.js file
      const { translations } = require('@/lib/translations');
      return NextResponse.json(translations);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read translations:", error);
    return NextResponse.json({ error: "Failed to read translations." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid translations payload." }, { status: 400 });
    }
    
    writeTranslations(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Failed to update translations:", error);
    return NextResponse.json({ error: "Failed to update translations." }, { status: 500 });
  }
}
