const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=["']?(.*?)["']?$`, 'm'));
  return match ? match[1].replace(/\\n/g, '\n') : '';
}

const serviceAccount = {
  projectId: getEnv('FIREBASE_ADMIN_PROJECT_ID'),
  clientEmail: getEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
  privateKey: getEnv('FIREBASE_ADMIN_PRIVATE_KEY'),
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const uid = 'rKBqcuOAaOS4QdlfnMuttRPOEQA3';
getAuth().setCustomUserClaims(uid, { role: 'super_admin', tenantId: 'org_default' })
  .then(() => {
    console.log('Claims set to super_admin for', uid);
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
