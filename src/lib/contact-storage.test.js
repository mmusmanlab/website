const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');
const { appendContactMessage, readContactMessages } = require('./contact-storage.js');

test('appendContactMessage stores messages in a JSON file', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contact-storage-'));
  const filePath = path.join(tempDir, 'messages.json');

  const message = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello from the test suite',
  };

  const storedMessages = await appendContactMessage(filePath, message);

  assert.equal(storedMessages.length, 1);
  assert.equal(storedMessages[0].name, 'Ada Lovelace');
  assert.equal(storedMessages[0].email, 'ada@example.com');
  assert.equal(storedMessages[0].message, 'Hello from the test suite');

  const persistedMessages = await readContactMessages(filePath);
  assert.deepEqual(persistedMessages, storedMessages);

  await fs.rm(tempDir, { recursive: true, force: true });
});
