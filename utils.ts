// Encoder
export function encoder(type: number, data: Buffer): Buffer {
  const header = Buffer.alloc(2);
  header.writeUInt8(type, 0);
  header.writeUInt8(data.length, 1);
  return Buffer.concat([header, data]);
}

// Decoder
export function decoder(data: Buffer): { type: number; payload: Buffer } {
  const type = data.readUInt8(0);
  const length = data.readUInt8(1);
  const payload = data.slice(2, 2 + length);
  return { type, payload };
}
