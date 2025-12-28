/**
 * Helpers para respuestas HTTP
 * Extraído de src/lib/api-helpers.ts
 */

export function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message: string, status: number = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

