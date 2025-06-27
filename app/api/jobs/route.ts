import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '../../../lib/services/jobService';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const realmId = searchParams.get('realmId');

        const jobs = await JobService.getJobsByUserId(user.userId, realmId);
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, documentName, documentType, userId } = body;

        if (!documentId || !documentName || !documentType || !userId) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const job = await JobService.createJob({ documentId, documentName, documentType, userId });
        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Failed to create job:', error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
}
