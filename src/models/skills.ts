export const SKILL_NAMES = [
  "Overall",
  "Attack",
  "Defence",
  "Strength",
  "Constitution",
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
  "Summoning",
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

export const SKILL_IDS: Record<SkillName, number> = {
  Overall: 0,
  Attack: 1,
  Defence: 2,
  Strength: 3,
  Constitution: 4,
  Ranged: 5,
  Prayer: 6,
  Magic: 7,
  Cooking: 8,
  Woodcutting: 9,
  Fletching: 10,
  Fishing: 11,
  Firemaking: 12,
  Crafting: 13,
  Smithing: 14,
  Mining: 15,
  Herblore: 16,
  Agility: 17,
  Thieving: 18,
  Slayer: 19,
  Farming: 20,
  Runecrafting: 21,
  Hunter: 22,
  Construction: 23,
  Summoning: 24,
};

export class Skill {
  constructor(
    public id: number,
    public name: string,
    public level: number,
    public experience: number,
    public goal: number,
    public baseLevel: number
  ) {}

  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      experience: this.experience,
      goal: this.goal,
      baseLevel: this.baseLevel,
    };
  }
}

export interface MemberSkills {
  [memberName: string]: Skill[];
}

export class Skills {
  constructor(public memberSkills: MemberSkills) {}

  toPlainObject() {
    const plainObject: Record<string, any> = {};
    for (const [memberName, skills] of Object.entries(this.memberSkills)) {
      plainObject[memberName] = skills.map((skill) => skill.toPlainObject());
    }
    return plainObject;
  }
}
