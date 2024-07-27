import { Router, Request, Response } from "express";
import {
  getGroupIronmanMembers,
  getGroupRank,
} from "../services/group-service";
import { BankService } from "../services/bank-service";
import { SkillService } from "../services/skill-service";

const router = Router();
const bankService = new BankService();
const skillService = SkillService.getInstance();

router.get("/status", (req: Request, res: Response) => {
  res.sendStatus(200);
});

router.get("/getGroupIronmanMembers", async (req: Request, res: Response) => {
  const { groupName } = req.query;
  if (!groupName) {
    return res.status(400).json({ error: "Missing groupName query parameter" });
  }
  const members = await getGroupIronmanMembers(
    decodeURIComponent(groupName as string)
  );
  res.json(members);
});

router.get("/getGroupRank", async (req: Request, res: Response) => {
  const { groupName } = req.query;
  if (!groupName) {
    return res.status(400).json({ error: "Missing groupName query parameter" });
  }
  const rank = await getGroupRank(decodeURIComponent(groupName as string));
  res.json(rank);
});

router.post("/getBankItems", async (req: Request, res: Response) => {
  const { groupName, selectedBank } = req.body;
  let items;
  if (selectedBank === "All") {
    items = await bankService.getAllBankItems(groupName);
  } else {
    const memberName =
      selectedBank === "Group Storage" ? "groupStorage" : selectedBank;
    items = await bankService.getBankItems(groupName, memberName);
  }
  res.json(items);
});

router.post("/updateBankItems", async (req: Request, res: Response) => {
  const { group, user, items } = req.body;
  await bankService.updateBankItems(group, user, items);
  res.sendStatus(200);
});

router.get("/getMemberSkills", async (req: Request, res: Response) => {
  const { memberName } = req.query;
  if (!memberName) {
    return res
      .status(400)
      .json({ error: "Missing memberName query parameter" });
  }
  const skills = await skillService.getMemberSkills(memberName as string);
  res.json(skills);
});

router.post("/pinSkill", async (req: Request, res: Response) => {
  const { groupName, userName, skillsId, goal } = req.body;

  console.log(`Request body:`, req.body);

  const success = await skillService.pinSkill(
    groupName,
    userName,
    skillsId,
    goal
  );

  if (success) {
    res.sendStatus(200);
  } else {
    res.status(500).json({ error: "Failed to pin skill" });
  }
});

router.get("/getPinnedSkills", async (req, res) => {
  const groupName = req.query.groupName;
  if (typeof groupName !== "string") {
    return res.status(400).json({ error: "Invalid groupName parameter" });
  }

  try {
    const skills = await skillService.getPinnedSkills(groupName);
    res.json(skills);
  } catch (error) {
    console.error("Error fetching pinned skills:", error);
    res.status(500).json({ error: "Failed to fetch pinned skills" });
  }
});

router.post("/unpinSkill", async (req: Request, res: Response) => {
  const { groupName, userName, skillsId } = req.body;
  try {
    const success = await skillService.unpinSkill(
      groupName,
      userName,
      skillsId
    );
    if (success) {
      res.sendStatus(200);
    } else {
      res.status(500).json({ error: "Failed to unpin skill" });
    }
  } catch (error) {
    console.error("Error unpinning skill:", error);
    res.status(500).json({ error: "Failed to unpin skill" });
  }
});

export default router;
