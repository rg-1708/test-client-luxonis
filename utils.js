"use strict";
exports.__esModule = true;
exports.decoder = exports.encoder = void 0;
// Encoder
function encoder(type, data) {
    var header = Buffer.alloc(2);
    header.writeUInt8(type, 0);
    header.writeUInt8(data.length, 1);
    return Buffer.concat([header, data]);
}
exports.encoder = encoder;
// Decoder
function decoder(data) {
    var type = data.readUInt8(0);
    var length = data.readUInt8(1);
    var payload = data.slice(2, 2 + length);
    return { type: type, payload: payload };
}
exports.decoder = decoder;
