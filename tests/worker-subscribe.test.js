import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidEmail, isHoneypotFilled } from '../worker/subscribe/src/index.js';

describe('subscribe worker helpers', () => {
  it('validates emails the same way as the form', () => {
    assert.strictEqual(isValidEmail('user@example.com'), true);
    assert.strictEqual(isValidEmail('bad'), false);
    assert.strictEqual(isValidEmail(''), false);
  });

  it('accepts honeypot company/website fields', () => {
    assert.strictEqual(isHoneypotFilled(''), false);
    assert.strictEqual(isHoneypotFilled('spam-bot'), true);
  });
});
