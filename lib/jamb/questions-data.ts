import questionStems from "@/data/questions-stems.json";
import questionAnswers from "@/data/questions-answers.json";
import type { OptionLetter, Question, WhyOthersWrong } from "./types";

type StemRow = (typeof questionStems)[number];
type AnswerRow = (typeof questionAnswers)[number];

function mergeQuestions(): Question[] {
  const answerById = new Map<string, AnswerRow>(
    questionAnswers.map((a) => [a.id, a]),
  );
  return questionStems.map((s: StemRow) => {
    const a = answerById.get(s.id);
    if (!a) {
      throw new Error(`Missing answer row for question id "${s.id}"`);
    }
    const options = { ...s.options } as Question["options"];
    return {
      id: s.id,
      year: s.year,
      examLabel: s.examLabel,
      topicIds: s.topicIds,
      stem: s.stem,
      options,
      diagramKey: s.diagramKey,
      correctOption: a.correctOption as OptionLetter,
      whyCorrect: a.whyCorrect,
      whyOthersWrong: a.whyOthersWrong as WhyOthersWrong,
      needsHumanReview: a.needsHumanReview,
    };
  });
}

export const QUESTIONS: Question[] = mergeQuestions();

export function getQuestionsForTopic(topicId: string): Question[] {
  return QUESTIONS.filter((q) => q.topicIds.includes(topicId));
}
