import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AuthService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.validation.js';
export const AuthController = {
  users: catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Users retrieved',
      data: await AuthService.users(res.locals.user.companyId),
    }),
  ),
  register: catchAsync(async (req, res) => {
    const data = await AuthService.register(registerSchema.parse(req.body));
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Registration successful',
      data,
    });
  }),
  login: catchAsync(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const data = await AuthService.login(input.identifier, input.password);
    sendResponse(res, { statusCode: status.OK, success: true, message: 'Login successful', data });
  }),
};
