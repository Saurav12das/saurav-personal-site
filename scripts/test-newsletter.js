const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/subscribe');
const config = require('../data/newsletter.json');

function setup(responses = []) {
  let time = 1791244800000;
  const calls = [];
  const handler = createHandler({
    env: { RESEND_API_KEY: 'test-only-not-a-real-key', NEWSLETTER_SIGNUP_ENABLED: 'true', NODE_ENV: 'production' },
    now: () => time,
    fetcher: async (url, options) => {
      calls.push({ url, ...options });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      assert.ok(response, 'Unexpected provider call');
      return new Response(JSON.stringify(response.body || {}), { status: response.status });
    }
  });
  const request = async (method, body, headers = {}) => {
    const result = { headers: {} };
    await handler({ method, body, headers: { origin: 'https://sauravdas.me', 'content-type': 'application/json', 'x-real-ip': '192.0.2.1', ...headers } }, {
      setHeader: (name, value) => { result.headers[name] = value; },
      status(status) { result.status = status; return this; },
      json(body) { result.body = body; return this; }
    });
    return result;
  };
  return { request, calls, advance: value => { time += value; }, async form() {
    const { body } = await request('GET');
    time += 2000;
    return { email: 'Reader@Example.com ', topics: ['brain-fog', 'bookshelf'], consent: true, website: '', token: body.token };
  } };
}

test('new contacts receive exactly their selected topics and a consent record', async () => {
  const s = setup([{ status: 404 }, { status: 201, body: { id: 'new-contact' } }]);
  const result = await s.request('POST', await s.form());
  assert.equal(result.status, 202);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal(s.calls.length, 2);
  assert.equal(s.calls[1].url, 'https://api.resend.com/contacts');
  const body = JSON.parse(s.calls[1].body);
  assert.equal(body.email, 'reader@example.com');
  assert.deepEqual(body.segments, [{ id: config.segmentId }]);
  assert.deepEqual(body.topics.map(topic => topic.subscription), ['opt_out', 'opt_in', 'opt_out', 'opt_out', 'opt_in']);
  const consent = JSON.parse(body.properties.website_consent);
  assert.deepEqual(consent.topics, ['brain-fog', 'bookshelf']);
  assert.equal(consent.version, config.consentVersion);
  assert.ok(consent.at);
});

test('repeat requests never modify existing contacts, including unsubscribers', async () => {
  for (const unsubscribed of [false, true]) {
    const s = setup([{ status: 200, body: { id: 'existing', unsubscribed } }]);
    assert.equal((await s.request('POST', await s.form())).status, 202);
    assert.equal(s.calls.length, 1);
    assert.equal(s.calls[0].method, undefined);
  }
});

test('invalid consent, unknown topics, malformed emails and tampered tokens never reach Resend', async () => {
  const cases = [ { consent: false }, { topics: [] }, { topics: ['other'] }, { topics: ['brain-fog', 'brain-fog'] }, { email: 'not-email' }, { email: 99 }, { token: 'forged' } ];
  for (const change of cases) {
    const s = setup();
    assert.equal((await s.request('POST', { ...await s.form(), ...change })).status, 400);
    assert.equal(s.calls.length, 0);
  }
});

test('cross-origin, malformed and oversized requests fail before provider access', async () => {
  const s = setup(); const body = await s.form();
  assert.equal((await s.request('POST', body, { origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await s.request('POST', body, { origin: undefined })).status, 403);
  assert.equal((await s.request('POST', body, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await s.request('POST', '{oops')).status, 400);
  assert.equal((await s.request('POST', body, { 'content-length': '99999' })).status, 413);
  assert.equal((await s.request('DELETE', body)).status, 405);
  assert.equal(s.calls.length, 0);
});

test('expired and too-fast form tokens are rejected; honeypot submissions are discarded', async () => {
  const s = setup(); const body = await s.form();
  s.advance(-1999);
  assert.equal((await s.request('POST', body)).status, 400);
  s.advance(3600001);
  assert.equal((await s.request('POST', body)).status, 400);
  assert.equal((await s.request('POST', { ...body, website: 'spam.example' })).status, 202);
  assert.equal(s.calls.length, 0);
});

test('provider errors and timeouts do not report a saved subscriber', async () => {
  for (const responses of [[{ status: 500 }], [{ status: 401 }], [new Error('timeout')], [{ status: 404 }, { status: 429 }], [{ status: 404 }, { status: 200, body: {} }]]) {
    const s = setup(responses);
    const result = await s.request('POST', await s.form());
    assert.equal(result.status, 503);
    assert.ok(result.body.error);
    assert.equal(result.body.message, undefined);
  }
});

test('warm-instance throttle limits repeated submissions', async () => {
  const s = setup(Array.from({ length: 6 }, () => ({ status: 200 })));
  const body = await s.form();
  for (let i = 0; i < 5; i++) assert.equal((await s.request('POST', body)).status, 202);
  const limited = await s.request('POST', body);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers['Retry-After'], '900');
  assert.equal(s.calls.length, 5);
  s.advance(15 * 60 * 1000);
  assert.equal((await s.request('POST', body)).status, 202);
});

test('signup stays off until both credentials and explicit enablement exist', async () => {
  for (const env of [{}, { RESEND_API_KEY: 'test' }, { NEWSLETTER_SIGNUP_ENABLED: 'true' }]) {
    const handler = createHandler({ env, fetcher: () => assert.fail('Must not contact provider') });
    for (const method of ['GET', 'POST']) {
      let result;
      const res = { setHeader() {}, status(value) { this.code = value; return this; }, json(body) { result = { status: this.code, body }; } };
      await handler({ method }, res);
      assert.equal(result.status, method === 'GET' ? 200 : 503);
      if (method === 'GET') assert.deepEqual(result.body, { enabled: false });
    }
  }
});
