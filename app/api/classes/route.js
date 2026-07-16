import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'classes.json');

function readClasses() {
  if (!fs.existsSync(dataFilePath)) {
    return { general: {}, courses: [] };
  }
  const content = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(content || '{"general": {}, "courses": []}');
}

function writeClasses(data) {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = readClasses();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read classes:", error);
    return NextResponse.json({ error: "Failed to read classes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }
    
    writeClasses(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Failed to save classes:", error);
    return NextResponse.json({ error: "Failed to save classes." }, { status: 500 });
  }
}
