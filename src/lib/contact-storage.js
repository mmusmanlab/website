const fs = require('fs/promises');
const path = require('path');

async function readContactMessages(filePath = path.join(process.cwd(), 'src/lib/contact-messages.json')) {
  try {
    const { queryD1 } = require('./cloudflare-d1');
    const res = await queryD1('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
    if (res && res.success && Array.isArray(res.results) && res.results.length > 0) {
      return res.results.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        message: r.message,
        projectType: r.project_type,
        company: r.company,
        createdAt: r.created_at || r.createdAt,
      }));
    }
  } catch {
    // Fall back to file
  }

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
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: message.name,
    email: message.email,
    message: message.message,
    projectType: message.projectType || 'General',
    company: message.company || 'N/A',
    createdAt: new Date().toISOString(),
  };

  try {
    const { queryD1 } = require('./cloudflare-d1');
    await queryD1(
      'INSERT INTO contact_inquiries (id, name, email, message, project_type, company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [entry.id, entry.name, entry.email, entry.message, entry.projectType, entry.company, entry.createdAt]
    );
  } catch (err) {
    console.warn('[ContactStorage] D1 insert failed:', err);
  }

  try {
    const messages = await readContactMessages(filePath).catch(() => []);
    const nextMessages = [...messages, entry];
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(nextMessages, null, 2));
    return nextMessages;
  } catch {
    return [entry];
  }
}

module.exports = {
  readContactMessages,
  appendContactMessage,
};
