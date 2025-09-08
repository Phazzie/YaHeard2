import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { TranscriptionService } from '@/lib/types';

// This helper function dynamically loads all service modules.
// It's similar to the one in the transcribe route, but could be centralized in a future refactor.
async function getTranscriptionServices(): Promise<TranscriptionService[]> {
  const servicesDir = path.join(process.cwd(), 'lib/services');
  const files = await readdir(servicesDir);
  const serviceModules = await Promise.all(
    files
      // Ensure we don't try to import the baseService itself
      .filter(file => file.endsWith('.ts') && file !== 'baseService.ts')
      .map(async file => {
        const module = await import(`@/lib/services/${file.replace('.ts', '')}`);
        return module.default;
      })
  );
  return serviceModules.filter(service => service && typeof service.checkHealth === 'function');
}

export async function GET() {
  try {
    const services = await getTranscriptionServices();

    if (services.length === 0) {
        return NextResponse.json({ error: 'No transcription services found or configured.' }, { status: 500 });
    }

    const healthPromises = services.map(service =>
      service.checkHealth().then(status => ({ name: service.name, status }))
    );

    const results = await Promise.all(healthPromises);

    const healthStatus = results.reduce((acc, result) => {
      acc[result.name] = result.status;
      return acc;
    }, {} as Record<string, 'operational' | 'down'>);

    return NextResponse.json(healthStatus);

  } catch (error) {
    console.error('Health Check Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve service health' }, { status: 500 });
  }
}
