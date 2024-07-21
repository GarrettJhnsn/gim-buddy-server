import axios from "axios";
import * as cheerio from "cheerio";

const SKILL_NAMES = [
  "Overall",
  "Attack",
  "Defence",
  "Strength",
  "Hitpoints",
  "Ranged",
  "Prayer",
  "Magic",
  "Cooking",
  "Woodcutting",
  "Fletching",
  "Fishing",
  "Firemaking",
  "Crafting",
  "Smithing",
  "Mining",
  "Herblore",
  "Agility",
  "Thieving",
  "Slayer",
  "Farming",
  "Runecrafting",
  "Hunter",
  "Construction",
];

export async function fetchMemberSkills(
  memberName: string
): Promise<Map<string, number>> {
  const skills = new Map<string, number>();

  try {
    const response = await axios.get(
      `https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=${memberName}`
    );
    const data = response.data;

    data.split("\n").forEach((line: string, index: number) => {
      if (index < SKILL_NAMES.length) {
        const [level] = line.split(",");
        skills.set(SKILL_NAMES[index], parseInt(level, 10));
      }
    });
  } catch (error) {
    console.error(`Error fetching member skills for ${memberName}:`, error);
  }

  return skills;
}

export async function fetchGroupIronmanMembers(
  groupName: string
): Promise<string[]> {
  const members: string[] = [];

  try {
    const response = await axios.get(
      `https://secure.runescape.com/m=hiscore_oldschool_ironman/group-ironman/view-group?name=${groupName}`
    );
    const $ = cheerio.load(response.data);

    $("a.uc-scroll__link").each((index, element) => {
      let memberName = $(element).text();
      memberName = memberName.replace(/[^\x00-\x7F]/g, " "); // Replace non-ASCII characters with space
      members.push(memberName);
    });
  } catch (error) {
    console.error(
      `Error fetching group Ironman members for ${groupName}:`,
      error
    );
  }

  return members;
}

export async function fetchGroupRank(groupName: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://secure.runescape.com/m=hiscore_oldschool_ironman/group-ironman/?groupName=${groupName}`
    );
    const $ = cheerio.load(response.data);

    const groupRow = $("tr.uc-scroll__table-row--type-highlight").first();
    const rankCell = groupRow.find("td").first();

    if (rankCell.length > 0) {
      return rankCell.text();
    }
  } catch (error) {
    console.error(`Error fetching group rank for ${groupName}:`, error);
  }

  return "Rank not found";
}
