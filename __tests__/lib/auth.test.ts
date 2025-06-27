import { NextRequest } from 'next/server';
import { extractSSOHeaders, validateSSOUser, getAuthUser, requireAuth, requireRole } from '../../lib/auth';
import { UserService } from '../../lib/services/userService';
import * as jwt from 'jsonwebtoken';
import { authConfig } from '../../lib/auth-config';

// Mock dependencies
jest.mock('../../lib/services/userService');
jest.mock('jsonwebtoken');
jest.mock('../../lib/auth-config');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockAuthConfig = authConfig as jest.Mocked<typeof authConfig>;

describe('Auth Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default auth config
        mockAuthConfig.enableHeaderAuth = false;
        mockAuthConfig.ssoHeaderName = 'X-Remote-User';
        mockAuthConfig.ssoEmailHeader = 'X-Remote-Email';
        mockAuthConfig.ssoNameHeader = 'X-Remote-Name';
        mockAuthConfig.ssoRoleHeader = 'X-Remote-Role';
        
        // Mock environment
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('extractSSOHeaders', () => {
        it('should return null when header auth is disabled', () => {
            mockAuthConfig.enableHeaderAuth = false;
            
            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    'X-Remote-User': 'testuser',
                },
            });

            const result = extractSSOHeaders(request);
            expect(result).toBeNull();
        });

        it('should return null when username header is missing', () => {
            mockAuthConfig.enableHeaderAuth = true;
            
            const request = new NextRequest('http://localhost:3000');

            const result = extractSSOHeaders(request);
            expect(result).toBeNull();
        });

        it('should extract SSO headers when available', () => {
            mockAuthConfig.enableHeaderAuth = true;
            
            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    'X-Remote-User': 'testuser',
                    'X-Remote-Email': 'test@example.com',
                    'X-Remote-Name': 'Test User',
                    'X-Remote-Role': 'admin',
                },
            });

            const result = extractSSOHeaders(request);
            expect(result).toEqual({
                username: 'testuser',
                email: 'test@example.com',
                name: 'Test User',
                role: 'admin',
            });
        });
    });

    describe('validateSSOUser', () => {
        it('should return existing user when found by email', async () => {
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
            };

            mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);

            const headerData = {
                username: 'testuser',
                email: 'test@example.com',
                name: 'Test User',
                role: 'user',
            };

            const result = await validateSSOUser(headerData);

            expect(result).toEqual({
                userId: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
                authMethod: 'header',
            });
        });

        it('should create new user when not found', async () => {
            const mockNewUser = {
                id: 'user2',
                email: 'newuser@sso.local',
                name: 'newuser',
                role: 'USER',
            };

            mockUserService.getUserByEmail.mockResolvedValue(null);
            mockUserService.createUser.mockResolvedValue(mockNewUser as any);

            const headerData = {
                username: 'newuser',
            };

            const result = await validateSSOUser(headerData);

            expect(mockUserService.createUser).toHaveBeenCalledWith({
                name: 'newuser',
                email: 'newuser@sso.local',
                role: 'USER',
            });

            expect(result).toEqual({
                userId: 'user2',
                email: 'newuser@sso.local',
                name: 'newuser',
                role: 'USER',
                authMethod: 'header',
            });
        });
    });

    describe('getAuthUser', () => {
        it('should return user from JWT when valid token exists', async () => {
            const mockDecoded = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
            };

            mockJwt.verify.mockReturnValue(mockDecoded as any);

            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    Cookie: 'auth-token=valid-token',
                },
            });

            const result = await getAuthUser(request);

            expect(result).toEqual({
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt',
            });
        });

        it('should return null when no token exists', async () => {
            const request = new NextRequest('http://localhost:3000');

            const result = await getAuthUser(request);

            expect(result).toBeNull();
        });

        it('should return null when token is invalid', async () => {
            mockJwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    Cookie: 'auth-token=invalid-token',
                },
            });

            const result = await getAuthUser(request);

            expect(result).toBeNull();
        });
    });

    describe('requireAuth', () => {
        it('should return user when authenticated', async () => {
            const mockDecoded = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
            };

            mockJwt.verify.mockReturnValue(mockDecoded as any);

            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    Cookie: 'auth-token=valid-token',
                },
            });

            const result = await requireAuth(request);

            expect(result).toEqual({
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt',
            });
        });

        it('should throw error when not authenticated', async () => {
            // Ensure JWT verify throws an error for invalid/missing tokens
            mockJwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            
            const request = new NextRequest('http://localhost:3000');

            await expect(requireAuth(request)).rejects.toThrow('Authentication required');
        });
    });

    describe('requireRole', () => {
        it('should return user when role is allowed', async () => {
            const mockDecoded = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'ADMIN',
                name: 'Test User',
            };

            mockJwt.verify.mockReturnValue(mockDecoded as any);

            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    Cookie: 'auth-token=valid-token',
                },
            });

            const result = await requireRole(request, ['ADMIN', 'USER']);

            expect(result).toEqual({
                userId: 'user1',
                email: 'test@example.com',
                role: 'ADMIN',
                name: 'Test User',
                authMethod: 'jwt',
            });
        });

        it('should throw error when role is not allowed', async () => {
            const mockDecoded = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
            };

            mockJwt.verify.mockReturnValue(mockDecoded as any);

            const request = new NextRequest('http://localhost:3000', {
                headers: {
                    Cookie: 'auth-token=valid-token',
                },
            });

            await expect(requireRole(request, ['ADMIN'])).rejects.toThrow('Insufficient permissions');
        });

        it('should throw error when not authenticated', async () => {
            // Ensure JWT verify throws an error for invalid/missing tokens
            mockJwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            
            const request = new NextRequest('http://localhost:3000');

            await expect(requireRole(request, ['ADMIN'])).rejects.toThrow('Authentication required');
        });
    });
});