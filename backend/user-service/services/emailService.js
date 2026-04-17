const net = require('net');
const tls = require('tls');
const { once } = require('events');

function encodeBase64(value) {
  return Buffer.from(String(value || '')).toString('base64');
}

function normalizePassword(value) {
  return String(value || '').replace(/\s+/g, '');
}

function parseStatus(response) {
  const match = String(response || '').match(/^(\d{3})/m);
  return match ? Number(match[1]) : 0;
}

function createResponseReader(socket) {
  socket.setEncoding('utf8');
  let buffer = '';

  return () => new Promise((resolve, reject) => {
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
      socket.off('close', onClose);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onClose = () => {
      cleanup();
      reject(new Error('SMTP connection closed unexpectedly'));
    };

    const onData = (chunk) => {
      buffer += chunk;
      let newlineIndex = buffer.indexOf('\n');

      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, '');
        buffer = buffer.slice(newlineIndex + 1);

        if (/^\d{3} /.test(line)) {
          cleanup();
          resolve(line);
          return;
        }

        newlineIndex = buffer.indexOf('\n');
      }
    };

    socket.on('data', onData);
    socket.once('error', onError);
    socket.once('close', onClose);
  });
}

async function expectResponse(readResponse, expectedCodes) {
  const response = await readResponse();
  const status = parseStatus(response);
  if (!expectedCodes.includes(status)) {
    throw new Error(`SMTP error (${status}): ${response}`);
  }
  return response;
}

async function sendCommand(socket, readResponse, command, expectedCodes) {
  socket.write(`${command}\r\n`);
  return expectResponse(readResponse, expectedCodes);
}

class EmailService {
  assertConfigured() {
    if (!process.env.NODEMAILER_HOST || !process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
      throw new Error('Email service is not configured. Set NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, and NODEMAILER_PASS.');
    }
  }

  async createSocket() {
    const host = process.env.NODEMAILER_HOST;
    const port = Number(process.env.NODEMAILER_PORT || 587);

    if (port === 465) {
      const socket = tls.connect({ host, port, servername: host });
      await once(socket, 'secureConnect');
      return socket;
    }

    const socket = net.createConnection({ host, port });
    await once(socket, 'connect');
    return socket;
  }

  async sendPasswordResetOtpEmail(to, otp, name = '') {
    this.assertConfigured();

    const host = process.env.NODEMAILER_HOST;
    const port = Number(process.env.NODEMAILER_PORT || 587);
    const username = String(process.env.NODEMAILER_USER || '').trim();
    const password = normalizePassword(process.env.NODEMAILER_PASS);
    const from = process.env.NODEMAILER_FROM || username;
    const displayName = name ? ` ${name}` : '';
    const subject = 'Your Smart Healthcare password reset OTP';
    const textBody = [
      `Hello${displayName},`,
      '',
      'We received a request to reset your password.',
      `Use this OTP to reset your password: ${otp}`,
      'This OTP will expire in 10 minutes.',
      '',
      'If you did not request this, you can safely ignore this email.',
    ].join('\n');

    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      textBody,
      '.',
    ].join('\r\n');

    let socket = await this.createSocket();
    let readResponse = createResponseReader(socket);

    try {
      console.log(`Sending password reset OTP email to ${to} via ${host}:${port}`);
      await expectResponse(readResponse, [220]);
      await sendCommand(socket, readResponse, `EHLO ${host}`, [250]);

      if (port !== 465) {
        await sendCommand(socket, readResponse, 'STARTTLS', [220]);
        socket = tls.connect({ socket, servername: host });
        await once(socket, 'secureConnect');
        readResponse = createResponseReader(socket);
        await sendCommand(socket, readResponse, `EHLO ${host}`, [250]);
      }

      await sendCommand(socket, readResponse, 'AUTH LOGIN', [334]);
      await sendCommand(socket, readResponse, encodeBase64(username), [334]);
      await sendCommand(socket, readResponse, encodeBase64(password), [235]);
      await sendCommand(socket, readResponse, `MAIL FROM:<${username}>`, [250]);
      await sendCommand(socket, readResponse, `RCPT TO:<${to}>`, [250, 251]);
      await sendCommand(socket, readResponse, 'DATA', [354]);

      socket.write(`${message}\r\n`);
      await expectResponse(readResponse, [250]);

      socket.write('QUIT\r\n');
      await expectResponse(readResponse, [221]);
      console.log(`Password reset OTP email sent to ${to}`);
    } finally {
      socket.end();
    }
  }
}

module.exports = new EmailService();