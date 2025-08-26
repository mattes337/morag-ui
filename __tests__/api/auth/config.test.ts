import { NextRequest } from 'next/server';
import { GET } from '../../../app/api/auth/config/route';
import { authConfig } from '../../../lib/auth-config';

// Mock dependencies
jest.mock('../../../lib/auth-config');

const mockAuthConfig = authConfig as jest.Mocked<typeof authConfig>;

describe('/api/auth/config', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return auth configuration with auto-login enabled', async () => {
        mockAuthConfig.enableHeaderAuth = false;
        mockAuthConfig.enableAutoLogin = true;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';
        mockAuthConfig.autoLoginName = 'Development Admin';

        const request = new NextRequest('http://localhost:3000/api/auth/config', {
            method: 'GET',
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            enableHeaderAuth: false,
            enableAutoLogin: true,
            autoLoginEmail: 'admin@morag.local',
            autoLoginName: 'Development Admin',
        });
    });

    it('should return auth configuration with auto-login disabled', async () => {
        mockAuthConfig.enableHeaderAuth = true;
        mockAuthConfig.enableAutoLogin = false;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';
        mockAuthConfig.autoLoginName = 'Development Admin';

        const request = new NextRequest('http://localhost:3000/api/auth/config', {
            method: 'GET',
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            enableHeaderAuth: true,
            enableAutoLogin: false,
            autoLoginEmail: null,
            autoLoginName: null,
        });
    });

    it('should not expose password in configuration', async () => {
        mockAuthConfig.enableHeaderAuth = false;
        mockAuthConfig.enableAutoLogin = true;
        mockAuthConfig.autoLoginEmail = 'admin@morag.local';
        mockAuthConfig.autoLoginName = 'Development Admin';
        mockAuthConfig.autoLoginPassword = 'secret-password';

        const request = new NextRequest('http://localhost:3000/api/auth/config', {
            method: 'GET',
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).not.toHaveProperty('autoLoginPassword');
        expect(data).not.toHaveProperty('password');
    });

    it('should handle errors gracefully', async () => {
        // Mock authConfig to throw an error
        Object.defineProperty(mockAuthConfig, 'enableHeaderAuth', {
            get: () => {
                throw new Error('Configuration error');
            }
        });

        const request = new NextRequest('http://localhost:3000/api/auth/config', {
            method: 'GET',
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to get auth configuration');
    });
});
