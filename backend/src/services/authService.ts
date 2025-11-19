/**
 * Auth Service
 *
 * Handles user registration, login, logout, and session management.
 * Uses Prisma for database access and bcrypt for password hashing.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth';
import { RegisterDto, LoginDto, AuthResponse } from '../types';

const prisma = new PrismaClient(); // Prisma ORM client
const SALT_ROUNDS = 10; // bcrypt salt rounds for password hashing

/**
 * Register a new user
 * @param data - RegisterDto
 * @returns AuthResponse with token and user info
 */
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email);

  // Save session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    },
  };
};

/**
 * Login user
 * @param data - LoginDto
 * @returns AuthResponse with token and user info
 */
export const login = async (data: LoginDto): Promise<AuthResponse> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  // Save session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    },
  };
};

/**
 * Logout user (invalidate session)
 */
export const logout = async (token: string): Promise<void> => {
  await prisma.session.delete({
    where: { token },
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
