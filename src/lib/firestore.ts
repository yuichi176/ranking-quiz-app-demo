import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

const GOOGLE_APPLICATION_CREDENTIAL_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIAL_PATH;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

if (!GCP_PROJECT_ID) {
  throw new Error('Missing required environment variables: GCP_PROJECT_ID');
}

const app = initializeApp({
  projectId: GCP_PROJECT_ID,
  ...(GOOGLE_APPLICATION_CREDENTIAL_PATH && {
    keyFilename: GOOGLE_APPLICATION_CREDENTIAL_PATH,
  }),
});

const db = getFirestore(app);

export default db;
