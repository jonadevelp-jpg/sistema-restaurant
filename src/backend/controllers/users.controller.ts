/**
 * Controller para usuarios
 */

import { UsersService } from '../services/users.service';
import { createUserSchema } from '../validators/users.validator';
import { jsonResponse, errorResponse } from '../helpers';

export class UsersController {
  private service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  /**
   * POST /api/create-user
   * Crea un nuevo usuario
   */
  async create(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = createUserSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const user = await this.service.createUser(input);

      return jsonResponse({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error('[Users Controller] Error:', error);
      
      if (error.message.includes('configurada') || error.message.includes('configurado')) {
        return errorResponse(error.message, 500);
      }

      return errorResponse('Error creando usuario: ' + error.message, 400);
    }
  }
}

