import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || process.env.CLOUDFLARE_R2_BUCKET_NAME || 'sabbir-portfolio';
const publicUrl = process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

export const r2Enabled = Boolean(
  accountId && accessKeyId && secretAccessKey && bucketName && publicUrl
);

export const r2Client = r2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

export async function uploadToR2({
  fileBuffer,
  filename,
  contentType,
}: {
  fileBuffer: Buffer | Uint8Array;
  filename: string;
  contentType: string;
}): Promise<string> {
  if (!r2Enabled || !r2Client) {
    throw new Error(
      'Cloudflare R2 is not fully configured. Please check your environment variables.'
    );
  }

  const cleanPublicUrl = publicUrl.replace(/\/$/, '');

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return `${cleanPublicUrl}/${filename}`;
}