import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ServerConnectionService } from '@/lib/services/serverConnectionService';

/**
 * POST /api/servers/test-connection
 * Test connection to a database server
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    const {
      type,
      host,
      port,
      username,
      password,
      apiKey,
      database,
      collection
    } = body;
    
    if (!type || !host || !port) {
      return NextResponse.json(
        { error: 'Type, host, and port are required' },
        { status: 400 }
      );
    }
    
    // Test the connection
    const result = await ServerConnectionService.testConnection({
      type,
      host,
      port: parseInt(port),
      username,
      password,
      apiKey,
      database,
      collection,
    });
    
    return NextResponse.json({
      connectionTest: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error testing server connection:', error);
    return NextResponse.json(
      { error: 'Failed to test server connection' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/servers/test-connection/recommendations
 * Get recommended configuration for database types
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type) {
      // Return recommendations for all supported types
      const supportedTypes = [
        'qdrant',
        'neo4j', 
        'postgresql',
        'mysql',
        'mariadb',
        'mongodb',
        'redis'
      ];
      
      const recommendations = supportedTypes.reduce((acc, dbType) => {
        acc[dbType] = {
          ...ServerConnectionService.getRecommendedConfig(dbType),
          type: dbType,
        };
        return acc;
      }, {} as Record<string, any>);
      
      return NextResponse.json({
        recommendations,
        supportedTypes,
      });
    }
    
    // Return recommendation for specific type
    const recommendation = ServerConnectionService.getRecommendedConfig(type);
    
    return NextResponse.json({
      type,
      recommendation: {
        ...recommendation,
        type,
      },
    });
  } catch (error) {
    console.error('Error getting server recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get server recommendations' },
      { status: 500 }
    );
  }
}
