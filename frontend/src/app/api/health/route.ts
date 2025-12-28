import { NextResponse } from 'next/server';
import { apiUtil } from '@/lib/api';

export async function GET() {
  try {
    const result = await apiUtil.get('/health');
    
    if (result.error) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Backend connection failed',
          error: result.error
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      backend: result.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
