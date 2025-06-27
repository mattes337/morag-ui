import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { UserService } from '../../../../lib/services/userService';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request);
        
        if (!authUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get full user data from database
        const user = await UserService.getUserById(authUser.userId);
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase()
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}