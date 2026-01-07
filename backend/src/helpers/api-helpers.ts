/**
 * Helpers para respuestas API
 */

import { ApiResponse } from '../@types';

export function jsonResponse<T>(data: ApiResponse<T>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function successResponse<T>(data: T, message?: string, status: number = 200): Response {
  return jsonResponse(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    status
  );
}

export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse(
    {
      success: false,
      error: message,
    },
    status
  );
}




