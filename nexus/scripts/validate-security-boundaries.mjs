import assert from 'node:assert/strict';
import { isPublicAddress, validatePublicHttpUrl } from '../security/url-guard.js';

const fakePublicResolver = async () => [{ address: '93.184.216.34', family: 4 }];
const fakeMixedResolver = async () => [
  { address: '93.184.216.34', family: 4 },
  { address: '127.0.0.1', family: 4 },
];

for (const address of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '192.0.2.1', '198.51.100.1', '203.0.113.1', '169.254.169.254', '0.0.0.0', '224.0.0.1', '::1', 'fc00::1', 'fe80::1', 'ff02::1']) {
  assert.equal(isPublicAddress(address), false, `must reject non-public address: ${address}`);
}
for (const address of ['8.8.8.8', '93.184.216.34', '2606:4700:4700::1111']) {
  assert.equal(isPublicAddress(address), true, `must allow public address: ${address}`);
}
for (const input of [
  'file:///etc/passwd',
  'ftp://example.com/file',
  'http://localhost/admin',
  'http://127.0.0.1/',
  'http://169.254.169.254/latest/meta-data/',
  'http://[::1]/',
  'https://user:password@example.com/',
  'https://example.com:8443/',
]) {
  await assert.rejects(() => validatePublicHttpUrl(input, fakePublicResolver), undefined, input);
}
await assert.rejects(() => validatePublicHttpUrl('https://example.com/', fakeMixedResolver), /exclusivamente a direcciones IP públicas/);
assert.equal((await validatePublicHttpUrl('https://example.com/path', fakePublicResolver)).hostname, 'example.com');
console.log('OK: URL guard rejects local/private targets, credentials, unsupported schemes, unsafe ports, and mixed DNS answers.');
