import ApiError from '../../errors/ApiError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../prisma/lib/prisma.js';
import { env } from '../../../config/env.js';
export const AuthService = {
  users: (companyId: string) =>
    prisma.user.findMany({
      where: { companyId, isActive: true },
      select: { id: true, name: true, email: true, phone: true, role: true },
      orderBy: { name: 'asc' },
    }),
  async register(input: {
    email: string;
    phone?: string;
    name: string;
    password: string;
    companyName: string;
  }) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        name: input.name,
        passwordHash,
        company: { create: { name: input.companyName } },
      },
      include: { company: true },
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      accessToken: jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
      }),
    };
  },
  async login(identifier: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new ApiError(401, 'Invalid email, phone, or password');
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      accessToken: jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
      }),
    };
  },
};
