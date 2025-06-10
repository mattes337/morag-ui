import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services/userService';

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
    try {
        const user = await UserService.getUserByEmail(params.email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
