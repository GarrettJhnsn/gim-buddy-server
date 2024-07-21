import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { Item } from "../models/item";

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

  public async updateBankItems(
    group: string,
    user: string,
    items: Record<string, { id: number; quantity: number }>
  ): Promise<void> {
    if (!group?.trim() || !user?.trim()) {
      console.warn("Invalid group or user specified for updateBankItems");
      return;
    }

    const plainItems = Object.fromEntries(
      Object.entries(items).map(([key, item]) => [
        key,
        {
          id: item.id,
          quantity: item.quantity,
        },
      ])
    );

    const docRef = this.db
      .collection("groups")
      .doc(group)
      .collection("members")
      .doc(user);

    try {
      await docRef.set({ items: plainItems });
    } catch (error) {
      console.error("Error updating bank items:", error);
    }
  }

  public async getAllBankItems(group: string): Promise<Record<string, Item>> {
    if (!group?.trim()) {
      console.warn("Invalid group specified for getAllBankItems");
      return {};
    }

    const allItems: Record<string, Item> = {};
    const membersCollection = this.db
      .collection("groups")
      .doc(group)
      .collection("members");

    try {
      const snapshot = await membersCollection.get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.items) {
          for (const [name, item] of Object.entries(data.items)) {
            const itemData = item as { id: number; quantity: number };
            const newItem = new Item(itemData.id, itemData.quantity);
            if (allItems[name]) {
              allItems[name].quantity += newItem.quantity;
            } else {
              allItems[name] = newItem;
            }
          }
        }
      });
    } catch (error) {
      console.error("Error getting all bank items:", error);
    }

    return allItems;
  }

  public async getBankItems(
    group: string,
    member: string
  ): Promise<Record<string, Item>> {
    if (!group?.trim() || !member?.trim()) {
      console.warn("Invalid group or member specified for getBankItems");
      return {};
    }

    const normalizedMember =
      member.trim().toLowerCase() === "group storage" ? "groupStorage" : member;

    const docRef = this.db
      .collection("groups")
      .doc(group)
      .collection("members")
      .doc(normalizedMember);

    try {
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        const items: Record<string, Item> = {};
        for (const [name, item] of Object.entries(data?.items || {})) {
          const itemData = item as { id: number; quantity: number }; // Cast item to the expected type
          items[name] = new Item(itemData.id, itemData.quantity);
        }
        return items;
      } else {
        console.log("No such document!");
        return {};
      }
    } catch (error) {
      console.error("Error getting bank items:", error);
      return {};
    }
  }
}
