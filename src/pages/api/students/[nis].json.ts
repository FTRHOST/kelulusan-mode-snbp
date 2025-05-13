// src/pages/api/students/[nis].json.ts
import { students } from '../../../data/schoolData';

export const prerender = false; // Disable static pre-rendering

export function GET({ params }: { params: { nis: string } }) {
  const student = students.find(s => s.nis === params.nis);
  
  if (student) {
    return new Response(JSON.stringify(student), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } else {
    return new Response(JSON.stringify({ error: 'Student not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}