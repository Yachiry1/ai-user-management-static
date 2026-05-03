/* eslint-env node */
/* eslint-disable no-bitwise, no-console, no-plusplus */

const crypto = require('crypto');
const http = require('http');

const PORT = 8080;
const clients = new Set();

const createAcceptKey = (key) => crypto
    .createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');

const getTime = () => new Date().toLocaleTimeString();

const encodeFrame = (message) => {
    const payload = Buffer.from(message);

    if (payload.length < 126) {
        return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
    }

    if (payload.length < 65536) {
        const header = Buffer.alloc(4);

        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);

        return Buffer.concat([header, payload]);
    }

    const header = Buffer.alloc(10);

    header[0] = 0x81;
    header[1] = 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(payload.length, 6);

    return Buffer.concat([header, payload]);
};

const decodeFrame = (buffer) => {
    const opcode = buffer[0] & 0x0f;

    if (opcode === 8) {
        return null;
    }

    let length = buffer[1] & 0x7f;
    let offset = 2;

    if (length === 126) {
        length = buffer.readUInt16BE(offset);
        offset += 2;
    }

    if (length === 127) {
        const highBits = buffer.readUInt32BE(offset);
        const lowBits = buffer.readUInt32BE(offset + 4);

        length = highBits * 4294967296 + lowBits;
        offset += 8;
    }

    const mask = buffer.slice(offset, offset + 4);
    offset += 4;

    const payload = buffer.slice(offset, offset + length);

    for (let index = 0; index < payload.length; index++) {
        payload[index] ^= mask[index % 4];
    }

    return payload.toString('utf8');
};

const send = (socket, payload) => {
    socket.write(encodeFrame(JSON.stringify(payload)));
};

const createAssistantReply = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('welcome') || lowerText.includes('drink')) {
        return 'Try a fast welcome serve: sparkling lemonade, mint, citrus, and a small rosemary garnish.';
    }

    if (lowerText.includes('user') || lowerText.includes('admin')) {
        return 'Live update received. I can notify the bar admin team immediately.';
    }

    return 'Message received in real time through WebSocket. No page reload was needed.';
};

const handleMessage = (socket, rawMessage) => {
    let message;

    try {
        message = JSON.parse(rawMessage);
    } catch (error) {
        message = {
            text: rawMessage || error.message,
        };
    }

    send(socket, {
        author: 'Live Assistant',
        sentAt: getTime(),
        text: createAssistantReply(message.text || ''),
    });
};

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Mixology AI WebSocket server is running. Connect with ws://localhost:8080');
});

server.on('upgrade', (request, socket) => {
    const websocketKey = request.headers['sec-websocket-key'];

    if (!websocketKey) {
        socket.destroy();
        return;
    }

    socket.write([
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${createAcceptKey(websocketKey)}`,
        '',
        '',
    ].join('\r\n'));

    clients.add(socket);
    send(socket, {
        author: 'Live Assistant',
        sentAt: getTime(),
        text: 'Connected. Send a message and I will answer through the open WebSocket channel.',
    });

    socket.on('data', (buffer) => {
        const message = decodeFrame(buffer);

        if (message) {
            handleMessage(socket, message);
        }
    });

    socket.on('close', () => {
        clients.delete(socket);
    });

    socket.on('error', () => {
        clients.delete(socket);
    });
});

server.listen(PORT, () => {
    console.log(`WebSocket server: ws://localhost:${PORT}`);
});
