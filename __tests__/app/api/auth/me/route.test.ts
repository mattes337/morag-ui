import { NextRequest } from 'next/server';
import { GET } from '../../../../../app/api/auth/me/route';
import { getAuthUser, requireAuth } from '../../../../../lib/auth';
import { UserService } from '../../../../../lib/services/userService';

// Mock the auth and UserService
jest.mock('../../../../../lib/auth', () => ({
    getAuthUser: jest.fn(),
    requireAuth: jest.fn()
}));
jest.mock('../../../../../lib/services/userService');

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

// Mock static methods
const mockGetUserById = jest.fn();

(UserService.getUserById as jest.Mock) = mockGetUserById;

describe('/api/auth/me', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAuthUser.mockReturnValue(mockUser);
    });

    describe('GET', () => {
        it('should return the authenticated user', async () => {
            const mockAuthUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            mockGetAuthUser.mockReturnValue(mockAuthUser);
            mockGetUserById.mockResolvedValue(mockUser as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'admin'
                }
            });
            expect(mockGetAuthUser).toHaveBeenCalledWith(mockRequest);
            expect(mockGetUserById).toHaveBeenCalledWith('user1');
        });

        it('should return 401 if not authenticated', async () => {
            mockGetAuthUser.mockReturnValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Not authenticated' });
            expect(mockGetUserById).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            const mockAuthUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
            
            mockGetAuthUser.mockReturnValue(mockAuthUser);
            mockGetUserById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'User not found' });
        });

        it('should handle service errors', async () => {
            const mockAuthUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
            
            mockGetAuthUser.mockReturnValue(mockAuthUser);
            mockGetUserById.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });
    });
});