import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/auth/auto-login/route';
import { UserService } from '../../../lib/services/userService';
import { authConfig } from '../../../lib/auth-config';

// Mock dependencies
jest.mock('../../../lib/services/userService');
jest.mock('../../../lib/auth-config');
jest.mock('jsonwebtoken');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuthConfig = authConfig as jest.Mocked<typeof authConfig>;

describe('/api/auth/auto-login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
    });

    it('should return 403 when auto-login is disabled', async () => {
        mockAuthConfig.enableAutoLogin = false;

        const request = new NextRequest('http://localhost:3000/api/auth/auto-login', {
            method: 'POST',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Auto-login is not enabled');
    });

    it('should create user and return auth token when auto-login is enabled', async () => {
        mockAuthConfig.enableAutoLogin = true;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';
        mockAuthConfig.autoLoginName = 'Development Admin';
        mockAuthConfig.autoLoginPassword = 'admin123';

        const mockUser = {
            id: 'user-123',
            email: 'admin@morag.local',
            name: 'Development Admin',
            role: 'ADMIN',
        };

        mockUserService.getUserByEmail.mockResolvedValue(null);
        mockUserService.createUser.mockResolvedValue(mockUser as any);

        // Mock jsonwebtoken
        const jwt = require('jsonwebtoken');
        jwt.sign = jest.fn().mockReturnValue('mock-jwt-token');

        const request = new NextRequest('http://localhost:3000/api/auth/auto-login', {
            method: 'POST',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.user).toEqual({
            id: 'user-123',
            name: 'Development Admin',
            email: 'admin@morag.local',
            role: 'admin',
        });
        expect(data.authMethod).toBe('auto-login');

        // Verify user creation was called
        expect(mockUserService.createUser).toHaveBeenCalledWith({
            name: 'Development Admin',
            email: 'admin@morag.local',
            role: 'ADMIN',
            password: 'admin123',
        });

        // Verify JWT token was created
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                userId: 'user-123',
                email: 'admin@morag.local',
                role: 'ADMIN',
                name: 'Development Admin',
            },
            'test-secret',
            { expiresIn: '24h' }
        );

        // Verify cookie was set
        const setCookieHeaders = response.headers.getSetCookie();
        expect(setCookieHeaders.some(cookie => cookie.includes('auth-token=mock-jwt-token'))).toBe(true);
    });

    it('should use existing user when user already exists', async () => {
        mockAuthConfig.enableAutoLogin = true;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';

        const mockUser = {
            id: 'existing-user-123',
            email: 'admin@morag.local',
            name: 'Development Admin',
            role: 'ADMIN',
        };

        mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);

        // Mock jsonwebtoken
        const jwt = require('jsonwebtoken');
        jwt.sign = jest.fn().mockReturnValue('mock-jwt-token');

        const request = new NextRequest('http://localhost:3000/api/auth/auto-login', {
            method: 'POST',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.user.id).toBe('existing-user-123');

        // Verify user creation was NOT called
        expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it('should return 500 when user creation fails', async () => {
        mockAuthConfig.enableAutoLogin = true;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';

        mockUserService.getUserByEmail.mockResolvedValue(null);
        mockUserService.createUser.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/auth/auto-login', {
            method: 'POST',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to create or find auto-login user');
    });
});
