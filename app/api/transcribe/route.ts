import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { TranscriptionService, TranscriptionResult } from '@/lib/types';

async function getTranscriptionServices(): Promise<TranscriptionService[]> {
  const servicesDir = path.join(process.cwd(), 'lib/services');
  const files = await readdir(servicesDir);
  const serviceModules = await Promise.all(
    files
      .filter(file => file.endsWith('.ts'))
      .map(async file => {
        const module = await import(`@/lib/services/${file.replace('.ts', '')}`);
        return module.default;
      })
  );
  return serviceModules.filter(service => service && typeof service.transcribe === 'function');
}

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'audioUrl is required' }, { status: 400 });
    }

    const services = await getTranscriptionServices();

    if (services.length === 0) {
        return NextResponse.json({ error: 'No transcription services found or configured.' }, { status: 500 });
    }

    const transcriptionPromises = services.map(service => service.transcribe(audioUrl));

    const results = await Promise.allSettled(transcriptionPromises);

    const formattedResults: TranscriptionResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Handle rejected promises
        console.error(`Service ${services[index].name} failed:`, result.reason);
        return {
          serviceName: services[index].name,
          transcription: null,
          error: result.reason instanceof Error ? result.reason.message : 'An unknown error occurred.',
        };
      }
    });

    return NextResponse.json(formattedResults);

  } catch (error) {
    console.error('Transcription Orchestrator Error:', error);
    return NextResponse.json({ error: 'Failed to process transcriptions' }, { status: 500 });
  }
}
