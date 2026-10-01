export type AgeBand = "4-5" | "6-8" | "9-11";
export type CharacterType = "animal" | "robot" | "creature";
export type TrialPhase = "demonstration" | "practice" | "formal";

export interface Trial {
  trialNumber: number;
  phase: TrialPhase;
  displayNumbers: number[];
  missingNumber: number;
  displayDurationSeconds: number;
  responseWindowSeconds: number;
}

export interface Scene {
  sceneOrder: number;
  durationSeconds: number;
  characterType: CharacterType;
  characterName: string;
  characterState: string;
  visualAssetTag: string;
  audioScript: string;
  sourceText: string;
  trial?: Trial;
}

export interface PlanSection {
  sectionOrder: number;
  title: string;
  purpose: string;
  durationSeconds: number;
  requiredContent: string[];
}

export interface Storyline {
  ageBand: AgeBand;
  language: "en-US";
  targetDurationSeconds: number;
  plannedSections: PlanSection[];
  scenes: Scene[];
}

export type HindiStoryline = Omit<Storyline, "language" | "scenes"> & {
  language: "hi-IN";
  scenes: Array<Scene & { translatedText: string }>;
};

export interface PipelineScene extends Scene {
  translatedText: string;
  audioFile: string;
  audioDurationMs: number;
}

export type PipelineResult = Omit<HindiStoryline, "scenes"> & {
  approvedByResearcher: boolean;
  scenes: PipelineScene[];
};

export type OutputLanguage = "en-US" | "hi-IN";

const validAgeBands: AgeBand[] = ["4-5", "6-8", "9-11"];
const validCharacterTypes: CharacterType[] = ["animal", "robot", "creature"];
const validTrialPhases: TrialPhase[] = ["demonstration", "practice", "formal"];

export function validateStoryline(storyline: Storyline): string[] {
  const errors: string[] = [];
  if (!validAgeBands.includes(storyline.ageBand)) errors.push("Choose a supported age band.");
  if (!Number.isInteger(storyline.targetDurationSeconds) || storyline.targetDurationSeconds < 1) {
    errors.push("Target duration must be a positive whole number of seconds.");
  }
  if (storyline.plannedSections.length === 0) errors.push("Add at least one planned section.");
  if (storyline.scenes.length === 0) errors.push("Add at least one scene.");

  storyline.plannedSections.forEach((section) => {
    if (!Number.isInteger(section.sectionOrder) || section.sectionOrder < 1) errors.push("Section order must be a positive integer.");
    if (!section.title.trim() || !section.purpose.trim()) errors.push(`Section ${section.sectionOrder} needs a title and purpose.`);
    if (section.durationSeconds <= 0) errors.push(`Section ${section.sectionOrder} needs a positive duration.`);
    if (section.requiredContent.length === 0 || section.requiredContent.some((item) => !item.trim())) {
      errors.push(`Section ${section.sectionOrder} needs non-empty required content.`);
    }
  });

  storyline.scenes.forEach((scene) => {
    if (!Number.isInteger(scene.sceneOrder) || scene.sceneOrder < 1) errors.push("Scene order must be a positive integer.");
    if (scene.durationSeconds <= 0) errors.push(`Scene ${scene.sceneOrder} needs a positive duration.`);
    if (!validCharacterTypes.includes(scene.characterType)) errors.push(`Scene ${scene.sceneOrder} has an unsupported character type.`);
    if ([scene.characterName, scene.characterState, scene.visualAssetTag, scene.audioScript, scene.sourceText].some((value) => !value.trim())) {
      errors.push(`Scene ${scene.sceneOrder} has a required field left blank.`);
    }
    if (scene.trial) {
      const trial = scene.trial;
      if (!Number.isInteger(trial.trialNumber) || trial.trialNumber < 1) errors.push(`Scene ${scene.sceneOrder} trial number must be positive.`);
      if (!validTrialPhases.includes(trial.phase)) errors.push(`Scene ${scene.sceneOrder} has an unsupported trial phase.`);
      if (trial.displayNumbers.length === 0 || trial.displayNumbers.some((number) => !Number.isInteger(number))) errors.push(`Scene ${scene.sceneOrder} needs integer display numbers.`);
      if (!Number.isInteger(trial.missingNumber)) errors.push(`Scene ${scene.sceneOrder} missing number must be an integer.`);
      if (trial.displayDurationSeconds <= 0 || trial.responseWindowSeconds <= 0) errors.push(`Scene ${scene.sceneOrder} trial timings must be positive.`);
      if (!trial.displayNumbers.includes(trial.missingNumber)) errors.push(`Scene ${scene.sceneOrder} missing number must appear in displayNumbers.`);
    }
  });

  if (new Set(storyline.scenes.map((scene) => scene.characterName)).size > 1) {
    errors.push("Use one consistent character name throughout the storyline.");
  }
  const sectionDuration = storyline.plannedSections.reduce((sum, section) => sum + section.durationSeconds, 0);
  const sceneDuration = storyline.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  if (Math.abs(sectionDuration - storyline.targetDurationSeconds) > 0.001) errors.push("Planned section durations must sum to the target duration.");
  if (Math.abs(sceneDuration - storyline.targetDurationSeconds) > 0.001) errors.push("Scene durations must sum to the target duration.");

  return errors;
}