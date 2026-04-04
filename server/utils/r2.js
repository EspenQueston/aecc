const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const isR2Configured = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT);

let s3Client = null;

function getS3Client() {
  if (!s3Client && isR2Configured) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

async function uploadToR2(file) {
  const client = getS3Client();
  if (!client) return null;

  const ext = path.extname(file.originalname).toLowerCase();
  const key = `${crypto.randomBytes(16).toString('hex')}${ext}`;

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file.buffer || require('fs').readFileSync(file.path),
    ContentType: file.mimetype,
  }));

  // Return the public URL or the key
  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `/api/upload/${key}`;

  return { key, url: publicUrl, mimetype: file.mimetype, size: file.size };
}

async function deleteFromR2(key) {
  const client = getS3Client();
  if (!client) return;

  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  }));
}

async function getFromR2(key) {
  const client = getS3Client();
  if (!client) return null;

  const resp = await client.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  }));

  return resp;
}

module.exports = { uploadToR2, deleteFromR2, getFromR2, isR2Configured };
