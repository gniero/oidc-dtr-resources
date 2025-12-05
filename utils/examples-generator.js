// Node.js script to generate related OpenID Deferred Token Response Flow HTTP requests/responses with formatted line breaks and JWTs for access_token and DPoP

const crypto = require('crypto');

// Simple base64url encoding
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function randomString(len = 16) {
  return crypto.randomBytes(len).toString('base64url');
}

function nowEpoch() {
  return Math.floor(Date.now() / 1000);
}

function futureEpoch(seconds) {
  return nowEpoch() + seconds;
}

function formatParams(params) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n  &');
}

function formatJson(json) {
  // Pretty print and break lines longer than 80 chars
  return JSON.stringify(json, null, 2)
    .split('\n')
    .map(line => {
      if (line.length > 80) {
        // Break at 80 chars, indent continuation
        const parts = [];
        let str = line;
        while (str.length > 80) {
          parts.push(str.slice(0, 80));
          str = '    ' + str.slice(80);
        }
        parts.push(str);
        return parts.join('\n');
      }
      return line;
    })
    .join('\n');
}

// --- JWT Generation (unsigned for example purposes) ---

function makeJwt(header, payload) {
  return base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload)) + '.' + randomString(16);
}

// Access Token JWT
const accessTokenJwt = makeJwt(
  { alg: "RS256", typ: "JWT" },
  {
    iss: "https://server.example.com",
    sub: randomString(8),
    aud: "resource-server",
    client_id: randomString(8),
    scope: "openid profile email",
    exp: futureEpoch(3600),
    iat: nowEpoch(),
    jti: randomString(12)
  }
);

// DPoP JWT (RFC 9449, minimal example)
function makeDpopJwt(htm, htu, jti, iat) {
  return makeJwt(
    { typ: "dpop+jwt", alg: "ES256", jwk: { kty: "EC", crv: "P-256", x: randomString(32), y: randomString(32) } },
    {
      htm,
      htu,
      jti,
      iat
    }
  );
}

const dpopJwt = makeDpopJwt(
  "POST",
  "https://server.example.com/token",
  randomString(12),
  nowEpoch()
);

const host = 'server.example.com';
const clientHost = 'client.example.org';
const clientId = randomString(8);
const redirectUri = `https://${clientHost}/cb`;
const state = randomString(8);
const nonce = randomString(12);
const deferredCode = randomString(12);
const deferredAuthId = randomString(10);
const refreshToken = randomString(10);
const idToken = Buffer.from(JSON.stringify({
  iss: `https://${host}`,
  sub: randomString(8),
  email: 'johndoe@example.com',
  email_verified: false,
  aud: clientId,
  nonce: nonce,
  exp: futureEpoch(3600),
  iat: nowEpoch()
})).toString('base64url') + '.' + randomString(32);

function print(title, content) {
  console.log(`\n=== ${title} ===\n${content}\n`);
}

// 1. Authentication Request
print('Authentication Request',
`GET /authorize?
  ${formatParams({
    response_type: 'deferred_code',
    client_id: clientId,
    redirect_uri: encodeURIComponent(redirectUri),
    scope: 'openid%20profile%20email',
    nonce: nonce,
    state: state
  })} HTTP/1.1
Host: ${host}
`);

// 2. Authentication Request Acknowledgment
print('Authentication Request Acknowledgment',
`HTTP/1.1 302 Found
Location: ${redirectUri}?
  deferred_code=${deferredCode}
  &state=${state}
`);

// 3. Initial Token Request (Deferred Code Exchange)
print('Initial Token Request',
`POST /token HTTP/1.1
Host: ${host}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${Buffer.from(clientId + ':secret').toString('base64')}
DPoP: ${dpopJwt}

grant_type=urn:openid:params:grant-type:deferred
&deferred_code=${deferredCode}
&redirect_uri=${encodeURIComponent(redirectUri)}
`);

// 4. Initial Token Response
print('Initial Token Response',
`HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

${formatJson({
  deferred_auth_id: deferredAuthId,
  expires_in: 10800,
  interval: 60,
  id_token: idToken
})}
`);

// 5. Poll Request (Get Authentication Result)
print('Poll Request',
`POST /token HTTP/1.1
Host: ${host}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${Buffer.from(clientId + ':secret').toString('base64')}
DPoP: ${dpopJwt}

grant_type=urn:openid:params:grant-type:deferred
&deferred_auth_id=${deferredAuthId}
`);

// 6. Successful Token Response
print('Successful Token Response',
`HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

${formatJson({
  access_token: accessTokenJwt,
  token_type: "DPoP",
  expires_in: 3600,
  id_token: idToken,
  refresh_token: refreshToken
})}
`);

// 7. Ping Callback
print('Ping Callback',
`POST /cb HTTP/1.1
Host: ${clientHost}
Authorization: Bearer ${randomString(32)}
Content-Type: application/json

${formatJson({
  deferred_auth_id: deferredAuthId
})}
`);

// 8. Authentication Cancellation Request
print('Authentication Cancellation Request',
`POST /df-authentication/cancel HTTP/1.1
Host: ${host}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${Buffer.from(clientId + ':secret').toString('base64')}

deferred_auth_id=${deferredAuthId}
`);

// 9. Authentication Cancellation Response
print('Authentication Cancellation Response',
`HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
`);