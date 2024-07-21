import { Router, Request, Response } from "express";
import {
  fetchGroupIronmanMembers,
  fetchGroupRank,
} from "../services/group-service";
import { FirestoreService } from "../services/firestore-service";

const router = Router();
const firestoreService = FirestoreService.getInstance();

router.get("/status", (req: Request, res: Response) => {
  res.sendStatus(200);
});

router.get(
  "/fetchGroupIronmanMembers/:groupName",
  async (req: Request, res: Response) => {
    const { groupName } = req.params;
    const members = await fetchGroupIronmanMembers(
      decodeURIComponent(groupName)
    );
    res.json(members);
  }
);

router.get(
  "/fetchGroupRank/:groupName",
  async (req: Request, res: Response) => {
    const { groupName } = req.params;
    const rank = await fetchGroupRank(decodeURIComponent(groupName));
    res.json(rank);
  }
);

router.post("/getBankItems", async (req: Request, res: Response) => {
  const { groupName, selectedBank } = req.body;
  let items;
  if (selectedBank === "All") {
    items = await firestoreService?.getAllBankItems(groupName);
  } else {
    const memberName =
      selectedBank === "Group Storage" ? "groupStorage" : selectedBank;
    items = await firestoreService?.getBankItems(groupName, memberName);
  }
  res.json(items);
});

router.post("/updateBankItems", async (req: Request, res: Response) => {
  const { group, user, items } = req.body;
  await firestoreService?.updateBankItems(group, user, items);
  res.sendStatus(200);
});

export default router;
