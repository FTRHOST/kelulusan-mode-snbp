import { db, Comment, isDbError } from 'astro:db';
import type { APIRoute } from 'astro';

export const POST: APIRoute = (ctx) => {
  try {
    await db.insert(Comment).values({
      id: ctx.params.id,
      content: 'Hello, world!'
    });
  } catch (e) {
    if (isDbError(e)) {
      return new Response(`Cannot insert comment with id ${id}\n\n${e.message}`, { status: 400 });
    }
    return new Response('An unexpected error occurred', { status: 500 });
  }

  return new Response(null, { status: 201 });
};