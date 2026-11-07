import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // Simple PNG encoder using Node's built-in zlib
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Deep Navy background for maskable
        buffer[idx] = 11;     // R: #0B
        buffer[idx + 1] = 25; // G: #19
        buffer[idx + 2] = 44; // B: #2C
        buffer[idx + 3] = 255;
      } else {
        // Transparent outside circular badge
        if (dist > r) {
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 0;
          continue;
        }
      }

      // Inside circle
      if (dist <= r) {
        if (dist > r - (width > 200 ? 8 : 4)) {
          // Gold Border
          buffer[idx] = 212;    // R
          buffer[idx + 1] = 175; // G
          buffer[idx + 2] = 55;  // B
          buffer[idx + 3] = 255;
        } else {
          // Inner Deep Navy
          buffer[idx] = 15;     // R
          buffer[idx + 1] = 30; // G
          buffer[idx + 2] = 55; // B
          buffer[idx + 3] = 255;

          // Star / Symbol highlight at center
          if (dist < width * 0.15) {
            buffer[idx] = 245;
            buffer[idx + 1] = 190;
            buffer[idx + 2] = 40;
            buffer[idx + 3] = 255;
          }
        }
      }
    }
  }

  // PNG scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // Filter None
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (c ^ buf[n]) >>> 0;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcVal]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, false));
console.log('Icons generated successfully in public/');
