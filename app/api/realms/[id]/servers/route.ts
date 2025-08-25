import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { ServerService } from '@/lib/services/serverService';

/**
 * GET /api/realms/[id]/servers
 * Get servers for a specific realm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const realmId = params.id;
    
    if (!realmId) {
      return NextResponse.json(
        { error: 'Realm ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has access to this realm
    const realm = await RealmService.getRealmById(realmId, user.userId);
    if (!realm) {
      return NextResponse.json(
        { error: 'Realm not found or access denied' },
        { status: 404 }
      );
    }
    
    // Get servers for this realm
    const servers = await ServerService.getServersByRealm(realmId);
    
    // Format servers for response
    const formattedServers = servers.map(server => ({
      id: server.id,
      name: server.name,
      type: server.type,
      host: server.host,
      port: server.port,
      database: server.database,
      collection: server.collection,
      isActive: server.isActive,
      lastConnected: server.lastConnected?.toISOString(),
      createdAt: server.createdAt.toISOString(),
      updatedAt: server.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({ servers: formattedServers });
  } catch (error) {
    console.error('Error fetching realm servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realm servers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/realms/[id]/servers
 * Add a server to a realm
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const realmId = params.id;
    const body = await request.json();
    
    if (!realmId) {
      return NextResponse.json(
        { error: 'Realm ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has permission to add servers to this realm
    const realm = await RealmService.getRealmById(realmId, user.userId);
    if (!realm) {
      return NextResponse.json(
        { error: 'Realm not found or access denied' },
        { status: 404 }
      );
    }
    
    if (realm.userRole !== 'OWNER' && realm.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions to add servers' },
        { status: 403 }
      );
    }
    
    const {
      name,
      type,
      host,
      port,
      username,
      password,
      apiKey,
      database,
      collection,
      isActive = true
    } = body;
    
    if (!name || !type || !host || !port) {
      return NextResponse.json(
        { error: 'Name, type, host, and port are required' },
        { status: 400 }
      );
    }
    
    // Create server
    const server = await ServerService.createServer({
      name,
      type,
      host,
      port: parseInt(port),
      username,
      password,
      apiKey,
      database,
      collection,
      userId: user.userId,
      realmId,
      isActive,
    });
    
    return NextResponse.json({
      message: 'Server added to realm successfully',
      server: server ? {
        id: server.id,
        name: server.name,
        type: server.type,
        host: server.host,
        port: server.port,
        database: server.database,
        collection: server.collection,
        isActive: server.isActive,
        createdAt: server.createdAt.toISOString(),
        updatedAt: server.updatedAt.toISOString(),
      } : null
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding server to realm:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add server to realm' },
      { status: 500 }
    );
  }
}
