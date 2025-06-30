import { NextRequest } from 'next/server';
/**
 * @jest-environment node
 */
import { GET } from '../../../../../app/api/users/[email]/route';
import { UserService } from '../../../../../lib/services/userService';

// Mock the UserService
jest.mock('../../../../../lib/services/userService');

const mockUserService = jest.mocked(UserService);

describe('/api/users/[email]', () => {
    const mockParams = { email: 'test@example.com' };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return the user if it exists', async () => {
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/users/test@example.com');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockUser);
            expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should return 404 if the user does not exist', async () => {
            mockUserService.getUserByEmail.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/users/nonexistent@example.com');
            const response = await GET(mockRequest, { params: { email: 'nonexistent@example.com' } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'User not found' });
        });

        it('should handle service errors', async () => {
            mockUserService.getUserByEmail.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/users/test@example.com');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch user' });
        });
    });
});