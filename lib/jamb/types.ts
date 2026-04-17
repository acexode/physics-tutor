export type OptionLetter = "A" | "B" | "C" | "D" | "E";

export type QuestionOptions = {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
};

export type WhyOthersWrong = Partial<Record<OptionLetter, string>>;

export interface SyllabusTopic {
  id: string;
  jambNumber: number;
  title: string;
  contentNotes: string;
  objectives: string[];
}

export interface Question {
  id: string;
  year?: number;
  examLabel?: string;
  topicIds: string[];
  stem: string;
  options: QuestionOptions;
  correctOption: OptionLetter;
  whyCorrect: string;
  whyOthersWrong: WhyOthersWrong;
  diagramKey?: string;
  needsHumanReview?: boolean;
  hintObjectiveIndices?: number[];
}

export interface PhysicsConstant {
  id: string;
  label: string;
  latex: string;
  notes?: string;
}

export type ObjectiveMasteryMap = Record<string, boolean[]>;

const STORAGE_KEY = "physics-pulse-objective-mastery-v1";

export function loadObjectiveMastery(): ObjectiveMasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ObjectiveMasteryMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveObjectiveMastery(map: ObjectiveMasteryMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function toggleObjectiveMastered(
  topicId: string,
  objectiveIndex: number,
  totalObjectives: number,
): ObjectiveMasteryMap {
  const map = { ...loadObjectiveMastery() };
  const row = [...(map[topicId] ?? Array.from({ length: totalObjectives }, () => false))];
  while (row.length < totalObjectives) row.push(false);
  row[objectiveIndex] = !row[objectiveIndex];
  map[topicId] = row;
  saveObjectiveMastery(map);
  return map;
}

export function topicProgress(
  topicId: string,
  totalObjectives: number,
): { mastered: number; total: number } {
  const map = loadObjectiveMastery();
  const row = map[topicId] ?? [];
  const mastered = row.filter(Boolean).length;
  return { mastered, total: totalObjectives };
}
