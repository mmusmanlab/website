const fs = require('node:fs/promises');
const path = require('node:path');

async function readContactMessages(filePath = path.join(process.cwd(), 'src/lib/contact-messages.json')) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function appendContactMessage(filePath = path.join(process.cwd(), 'src/lib/contact-messages.json'), message) {
  const messages = await readContactMessages(filePath);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: message.name,
    email: message.email,
    message: message.message,
    createdAt: new Date().toISOString(),
  };

  const nextMessages = [...messages, entry];
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(nextMessages, null, 2));

  return nextMessages;
}

module.exports = {
  readContactMessages,
  appendContactMessage,
};
