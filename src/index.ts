import express from "express";
import router from "./routes";
import { FirestoreService } from "./services/firestore-service";

const app = express();

const firestoreService = FirestoreService.getInstance();

if (firestoreService) {
  app.use(express.json());
  app.use(router);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
} else {
  console.error("Failed to initialize Firestore service. Server not started.");
}
