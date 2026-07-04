import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

function readOrders() {
  if (!fs.existsSync(dataFilePath)) return [];
  const content = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(content || '[]');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const fileName = searchParams.get('fileName');

    if (!orderId || !fileName) {
      return new Response("Missing parameters: orderId and fileName are required.", { status: 400 });
    }

    const orders = readOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return new Response("Order not found.", { status: 404 });
    }

    const fileObj = order.special_files?.find(f => f.name === fileName);

    if (!fileObj || !fileObj.base64) {
      return new Response("File attachment not found.", { status: 404 });
    }

    // Parse base64 string (e.g. data:image/png;base64,iVBORw0KGgo...)
    const matches = fileObj.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new Response("Invalid file format.", { status: 500 });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileObj.name)}"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    return new Response("Internal Server Error: " + error.message, { status: 500 });
  }
}
