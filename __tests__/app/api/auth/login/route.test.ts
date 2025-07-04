/**
 * @jest-environment node
 */
import { POST } from '../../../../../app/api/auth/login/route';
import { UserService } from '../../../../../lib/services/userService';
import { sign } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { compare, hash } from 'bcryptjs';

// Mock the UserService, jsonwebtoken, and bcryptjs
jest.mock('../../../../../lib/services/userService');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

const mockUserService = jest.mocked(UserService);
const mockSign = sign as jest.MockedFunction<typeof sign>;
const mockCompare = compare as jest.MockedFunction<typeof compare>;
const mockHash = hash as jest.MockedFunction<typeof hash>;

describe('/api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (mockSign as any).mockReturnValue('mock-token');
        mockCompare.mockResolvedValue(true);
        mockHash.mockResolvedValue('hashed-password');
    });

    describe('POST', () => {
        it('should authenticate user with valid credentials', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN',
                password: 'hashed-password'
            };

            mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'admin@example.com',
                    password: 'admin123'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                user: {
                    id: 'user1',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin'
                },
                authMethod: 'jwt'
            });

            // Check that the cookie was set
            const cookies = response.headers.getSetCookie();
            expect(cookies.some(cookie => cookie.startsWith('auth-token='))).toBe(true);

            expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
            expect(mockSign).toHaveBeenCalledWith(
                { userId: 'user1', email: 'admin@example.com', role: 'ADMIN', name: 'Admin User' },
                expect.any(String),
                { expiresIn: '24h' }
            );
        });

        it('should create a new user if not found in database', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN',
                password: 'hashed-password'
            };

            mockUserService.getUserByEmail.mockResolvedValue(null);
            mockUserService.createUser.mockResolvedValue(mockUser as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'admin@example.com',
                    password: 'admin123'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockUserService.createUser).toHaveBeenCalledWith({
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN',
                password: expect.any(String)
            });
        });

        it('should return 400 if email or password is missing', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'admin@example.com'
                    // password missing
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Email and password are required' });
        });

        it('should return 401 for invalid credentials', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'invalid@example.com',
                    password: 'wrongpassword'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Invalid credentials' });
        });

        it('should handle service errors', async () => {
            mockUserService.getUserByEmail.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'admin@example.com',
                    password: 'admin123'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });
    });
});