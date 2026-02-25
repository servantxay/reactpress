import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Magic bytes signatures for allowed file types
const MAGIC_BYTES: Record<string, Buffer[]> = {
  'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  'image/gif': [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
  'image/webp': [Buffer.from('RIFF')],
  'application/pdf': [Buffer.from('%PDF')],
};

function checkMagicBytes(filePath: string, expectedMimeType: string): boolean {
  // Only check types we have signatures for; others pass through
  if (!(expectedMimeType in MAGIC_BYTES)) return true;

  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(8);
    fs.readSync(fd, buf, 0, 8, 0);
    fs.closeSync(fd);

    return MAGIC_BYTES[expectedMimeType].some((sig) => buf.subarray(0, sig.length).equals(sig));
  } catch {
    return false;
  }
}

export function uploadScan(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) {
    next();
    return;
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  if (!checkMagicBytes(filePath, mimeType)) {
    // Remove the file and reject
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore cleanup error
    }
    res.status(422).json({ error: 'File content does not match its declared type' });
    return;
  }

  next();
}
