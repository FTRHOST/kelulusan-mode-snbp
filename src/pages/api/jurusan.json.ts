// src/pages/api/jurusan.json.ts
import { jurusanList } from '../../data/schoolData';

export function GET() {
  return new Response(JSON.stringify(jurusanList), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // CORS header
    }
  });
}