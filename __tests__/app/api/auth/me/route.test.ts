import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/me/route';
import { getAuthUser } from '@/lib/auth';
import { UserService } from '@/lib/services/userService';

// Mock the dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/services/userService');

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>;
const mockUserService = UserService as jest.Mocked<typeof UserService>;

describe('/api/auth/me', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
    
    const mockGetUserById = jest.fn();
    (UserService.getUserById as jest.Mock) = mockGetUserById;
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAuthUser.mockResolvedValue(mockUser);
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

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockGetUserById.mockResolvedValue(mockUser as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            console.log('Actual response data:', JSON.stringify(data, null, 2));

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

        it('should return 401 if user is not authenticated', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
            expect(mockGetAuthUser).toHaveBeenCalledWith(mockRequest);
        });

        it('should return 404 if user not found', async () => {
            const mockAuthUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
            
            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockGetUserById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'User not found' });
            expect(mockGetAuthUser).toHaveBeenCalledWith(mockRequest);
            expect(mockGetUserById).toHaveBeenCalledWith('user1');
        });

        it('should return 500 if there is an error', async () => {
            const mockAuthUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
            
            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockGetUserById.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/auth/me');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
            expect(mockGetAuthUser).toHaveBeenCalledWith(mockRequest);
            expect(mockGetUserById).toHaveBeenCalledWith('user1');
        });
    });
});