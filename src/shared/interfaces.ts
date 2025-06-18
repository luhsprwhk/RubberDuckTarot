export interface Card {
  id: number;
  name: string;
  emoji: string;
  traditional_equivalent: string;
  core_meaning: string;
  duck_question: string;
  visual_description: string;
  perspective_prompts: string[];
  block_applications: {
    creative: string;
    decision: string;
    work: string;
    life: string;
    relationship: string;
  };
  duck_wisdom: string;
  reversed_meaning: string;
  tags: string[];
}
