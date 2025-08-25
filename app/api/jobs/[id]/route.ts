import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '../../../../lib/services/jobService';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const job = await JobService.getJobWithFreshStatus(params.id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error('Failed to get job:', error);
        return NextResponse.json({ error: 'Failed to get job' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { percentage, summary } = body;

        if (percentage !== undefined && summary !== undefined) {
            const job = await JobService.updateJobProgress(params.id, percentage, summary);
            return NextResponse.json(job);
        } else {
            const job = await JobService.updateJob(params.id, body);
            return NextResponse.json(job);
        }
    } catch (error) {
        console.error('Failed to update job:', error);
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
}
