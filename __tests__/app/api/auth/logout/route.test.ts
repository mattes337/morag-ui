import { NextRequest } from 'next/server';
import { POST } from '../../../../../app/api/auth/logout/route';

describe('/api/auth/logout', () => {
    describe('POST', () => {
        it('should log out the user and clear the auth cookie', async () => {
            const response = await POST();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ message: 'Logged out successfully' });

            // Check that the cookie was cleared
            const cookies = response.headers.getSetCookie();
            expect(cookies.some(cookie => cookie.startsWith('auth-token='))).toBe(true);
            
            // Verify the cookie is set to expire immediately
            const authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
            expect(authCookie).toContain('max-age=0');
        });
    });
});