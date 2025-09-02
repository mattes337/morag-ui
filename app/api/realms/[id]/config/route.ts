import { NextRequest, NextResponse } from 'next/server';
import { RealmService } from '@/lib/services/realmService';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const realmId = params.id;
    const config = await RealmService.getRealmConfig(realmId, user.userId);

    if (!config) {
      return NextResponse.json({ error: 'Realm not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching realm configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realm configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const realmId = params.id;
    const configData = await request.json();

    const updatedRealm = await RealmService.updateRealmConfig(
      realmId,
      user.userId,
      configData
    );

    if (!updatedRealm) {
      return NextResponse.json({ error: 'Realm not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, realm: updatedRealm });
  } catch (error: any) {
    console.error('Error updating realm configuration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update realm configuration' },
      { status: 500 }
    );
  }
}
