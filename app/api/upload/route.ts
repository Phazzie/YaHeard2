import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const { SPACES_ENDPOINT, SPACES_REGION, SPACES_ACCESS_KEY_ID, SPACES_SECRET_ACCESS_KEY, SPACES_BUCKET_NAME } = process.env;

  if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_ACCESS_KEY_ID || !SPACES_SECRET_ACCESS_KEY || !SPACES_BUCKET_NAME) {
    return new Response(JSON.stringify({ error: 'Storage service is not configured. Please check your environment variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize the S3 client with DigitalOcean Spaces configuration
  const s3Client = new S3Client({
    endpoint: `https://${SPACES_ENDPOINT}`,
    region: SPACES_REGION,
    credentials: {
      accessKeyId: SPACES_ACCESS_KEY_ID,
      secretAccessKey: SPACES_SECRET_ACCESS_KEY,
    },
  });

  try {
    const { filename, fileType } = await request.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Filename and fileType are required' }, { status: 400 });
    }

    // Generate a unique key for the file to prevent overwrites
    const uniqueKey = `${randomUUID()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.SPACES_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
      ACL: 'public-read', // Make the file publicly accessible
    });

    // Generate the pre-signed URL
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 }); // URL expires in 10 minutes

    // Construct the public URL
    const publicUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_ENDPOINT}/${uniqueKey}`;

    return NextResponse.json({ signedUrl, publicUrl });

  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    return NextResponse.json({ error: 'Failed to create pre-signed URL' }, { status: 500 });
  }
}
