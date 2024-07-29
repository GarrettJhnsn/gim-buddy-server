import { Item } from "../models/item";
import { FirestoreService } from "./firestore-service";

export class BankService {
  private firestoreService: FirestoreService;

  constructor() {
    this.firestoreService = FirestoreService.getInstance();
  }

  public async getAllBankItems(group: string): Promise<Record<string, Item>> {
    if (!group?.trim()) {
      console.warn("Invalid group specified for getAllBankItems");
      return {};
    }

    const allItems: Record<string, Item> = {};
    const membersCollection = this.firestoreService.db
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

    const docRef = this.firestoreService.db
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
          const itemData = item as { id: number; quantity: number };
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

    const docRef = this.firestoreService.db
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
}
