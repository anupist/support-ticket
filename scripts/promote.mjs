import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const match = env.match(/^FIREBASE_ADMIN_PRIVATE_KEY="(.*)"$/m);
const privateKey = match[1].replace(/\\n/g, '\n');

const sa = {
  projectId: 'support-ticket-system-459ee',
  clientEmail: 'firebase-adminsdk-fbsvc@support-ticket-system-459ee.iam.gserviceaccount.com',
  privateKey,
};

if (!getApps().length) {
  initializeApp({ credential: cert(sa) });
}

const uid = 'rKBqcuOAaOS4QdlfnMuttRPOEQA3';
getAuth().setCustomUserClaims(uid, { role: 'super_admin', tenantId: 'org_default' })
  .then(() => { console.log('Done'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
