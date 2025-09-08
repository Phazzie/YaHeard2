import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// Initialize the S3 client with DigitalOcean Spaces configuration
const s3Client = new S3Client({
  endpoint: `https://${process.env.SPACES_ENDPOINT}`,
  region: process.env.SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
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
