import axios from "axios";
import { FirestoreService } from "./firestore-service";
import {
  Skill,
  SkillName,
  SKILL_NAMES,
  SKILL_IDS,
  MemberSkills,
  Skills,
} from "../models/skills";

export class SkillService {
  private static instance: SkillService;
  private firestoreService: FirestoreService;

  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
  }

  public static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService();
    }
    return SkillService.instance;
  }

  public async getMemberSkills(
    memberName: string
  ): Promise<Map<SkillName, Skill>> {
    const skills = new Map<SkillName, Skill>();

    if (!memberName) {
      console.error("fetchMemberSkills: memberName is null or undefined");
      return skills;
    }

    try {
      const response = await axios.get(
        `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${memberName}`
      );
      const data = response.data;

      console.log(`Response data for member ${memberName}:\n${data}`);

      if (!data || typeof data !== "string") {
        console.error(
          `Unexpected response structure for member ${memberName}:`,
          data
        );
        throw new Error("Invalid response structure");
      }

      const skillLines = data.split("\n");
      const baseLevel = 1;

      skillLines
        .slice(0, SKILL_NAMES.length)
        .forEach((line: string, index: number) => {
          const [rank, level, experience] = line.split(",");
          const skillName = SKILL_NAMES[index];
          if (skillName && level !== "-1" && experience !== "-1") {
            skills.set(
              skillName,
              new Skill(
                SKILL_IDS[skillName],
                skillName,
                parseInt(level),
                parseInt(experience),
                0,
                baseLevel
              )
            );
          }
        });

      console.log(`Parsed skills for member ${memberName}:`, skills);
    } catch (error) {
      console.error(`Error fetching member skills for ${memberName}:`, error);
    }

    return skills;
  }

  public async pinSkill(
    groupName: string,
    userName: string,
    skillID: number,
    goal: number
  ): Promise<boolean> {
    if (!groupName || !userName || skillID == null || goal == null) {
      console.error("pinSkill: Invalid input parameters");
      return false;
    }

    try {
      console.log(`Received skillID: ${skillID}`);

      if (!Object.values(SKILL_IDS).includes(skillID)) {
        throw new Error(`Invalid skill ID: ${skillID}`);
      }

      if (goal <= 0) {
        throw new Error(`Invalid goal: ${goal}. It must be greater than 0.`);
      }

      const skills = await this.getMemberSkills(userName);

      const skill = Array.from(skills.values()).find(
        (skill) => skill.id === skillID
      );

      if (!skill) {
        throw new Error(
          `Skill with ID ${skillID} not found for user ${userName}`
        );
      }

      skill.goal = goal;
      skill.baseLevel = skill.level;

      const skillRef = this.firestoreService.db
        .collection("groups")
        .doc(groupName)
        .collection("members")
        .doc(userName)
        .collection("pinnedSkills")
        .doc(skill.name);

      await skillRef.set({
        id: skill.id,
        name: skill.name,
        level: skill.level,
        experience: skill.experience,
        goal: skill.goal,
        baseLevel: skill.baseLevel,
      });

      return true;
    } catch (error) {
      console.error("Error pinning skill:", error);
      return false;
    }
  }

  public async getPinnedSkills(groupName: string): Promise<Skills> {
    if (!groupName) {
      console.error("getPinnedSkills: groupName is null or undefined");
      return new Skills({});
    }

    try {
      console.log(`Fetching members for group: ${groupName}`);
      const membersRef = this.firestoreService.db
        .collection("groups")
        .doc(groupName)
        .collection("members");

      const membersSnapshot = await membersRef.get();
      if (membersSnapshot.empty) {
        console.warn(
          `getPinnedSkills: No members found for group: ${groupName}`
        );
        return new Skills({});
      }

      const memberSkills: MemberSkills = {};

      for (const memberDoc of membersSnapshot.docs) {
        const memberName = memberDoc.id;
        console.log(`Fetching pinnedSkills for member: ${memberName}`);

        const pinnedSkillsRef = memberDoc.ref.collection("pinnedSkills");
        const pinnedSkillsSnapshot = await pinnedSkillsRef.get();

        const skills: Skill[] = [];
        pinnedSkillsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            console.log(`Fetched skill data: ${JSON.stringify(data)}`);
            const skill = new Skill(
              data.id,
              data.name,
              data.level,
              data.experience,
              data.goal,
              data.baseLevel
            );

            skills.push(skill);
          } else {
            console.warn(
              `getPinnedSkills: No data found for pinned skill: ${doc.id}`
            );
          }
        });

        memberSkills[memberName] = skills;
      }

      console.log(`Fetched pinned skills for group: ${groupName}`);
      return new Skills(memberSkills);
    } catch (error) {
      console.error("Error in getPinnedSkills:", error);
      throw error;
    }
  }

  public async unpinSkill(
    groupName: string,
    userName: string,
    skillID: number
  ): Promise<boolean> {
    if (!groupName || !userName || skillID == null) {
      console.error("unpinSkill: Invalid input parameters");
      return false;
    }

    try {
      const skillName = Object.keys(SKILL_IDS).find(
        (key) => SKILL_IDS[key as SkillName] === skillID
      ) as SkillName;

      if (!skillName) {
        throw new Error(`Skill with ID ${skillID} not found in SKILL_IDS`);
      }

      const skillRef = this.firestoreService.db
        .collection("groups")
        .doc(groupName)
        .collection("members")
        .doc(userName)
        .collection("pinnedSkills")
        .doc(skillName);
      await skillRef.delete();
      return true;
    } catch (error) {
      console.error("Error unpinning skill:", error);
      return false;
    }
  }
}
