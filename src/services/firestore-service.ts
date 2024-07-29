import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

export class FirestoreService {
  private static instance: FirestoreService;
  public db: admin.firestore.Firestore;

  private constructor(serviceAccount: admin.ServiceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    this.db = admin.firestore();
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      console.log("Parsed Service Account:", serviceAccount);

      FirestoreService.instance = new FirestoreService(
        serviceAccount as admin.ServiceAccount
      );
    }
    return FirestoreService.instance;
  }
}
