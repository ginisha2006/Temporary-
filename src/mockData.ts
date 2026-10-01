import type { HindiStoryline, Storyline } from "./scriptModel";

export const sampleInstruction = "Show six numbers for exactly 2 seconds. Hide one number and ask the child to identify it. Include one practice round and three formal trials, then give a short closing. Do not tell the child whether an answer was correct.";

export const sampleStoryline: Storyline = {
  ageBand: "9-11",
  language: "en-US",
  targetDurationSeconds: 60,
  plannedSections: [
    {
      sectionOrder: 1,
      title: "Introduction",
      purpose: "Explain the activity and introduce the character",
      durationSeconds: 10,
      requiredContent: [
        "Introduce the character, a friendly digital owl named Ollie",
        "Explain that Ollie will show six numbers for 2 seconds",
        "Describe the response: identify the hidden number",
      ],
    },
    {
      sectionOrder: 2,
      title: "Practice Round",
      purpose: "Allow the child to practice identifying the hidden number",
      durationSeconds: 10,
      requiredContent: [
        "Show six numbers for 2 seconds",
        "Hide one number and ask the child to identify it",
        "Provide confirmation that the practice round is complete",
      ],
    },
    {
      sectionOrder: 3,
      title: "Formal Trials",
      purpose: "Conduct three formal trials of the number memory task",
      durationSeconds: 35,
      requiredContent: [
        "Trial 1: Show six numbers for 2 seconds, hide one number, ask the child to identify it",
        "Trial 2: Show six numbers for 2 seconds, hide one number, ask the child to identify it",
        "Trial 3: Show six numbers for 2 seconds, hide one number, ask the child to identify it",
        "Confirm completion of all three formal trials",
      ],
    },
    {
      sectionOrder: 4,
      title: "Closing",
      purpose: "Conclude the experiment and thank the child",
      durationSeconds: 5,
      requiredContent: ["Thank the child for participating", "End the experiment"],
    },
  ],
  scenes: [
    { sceneOrder: 1, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "waving", visualAssetTag: "intro", audioScript: "Hi, I am Ollie the owl. I will show you six numbers for two seconds.", sourceText: "Hi, I am Ollie the owl. I will show you six numbers for two seconds." },
    { sceneOrder: 2, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "thinking", visualAssetTag: "intro", audioScript: "Then, I will hide one number. You will name the missing number.", sourceText: "Then, I will hide one number. You will name the missing number." },
    { sceneOrder: 3, durationSeconds: 2, characterType: "animal", characterName: "Ollie", characterState: "watching", visualAssetTag: "numbers_display", audioScript: "Look at these numbers; [PAUSE 2 seconds]", sourceText: "Look at these numbers; [PAUSE 2 seconds]" },
    { sceneOrder: 4, durationSeconds: 8, characterType: "animal", characterName: "Ollie", characterState: "asking", visualAssetTag: "hidden_number", audioScript: "One number is hidden; [PAUSE 1 second] Which number is missing? [PAUSE 2 seconds] Good practice.", sourceText: "One number is hidden; [PAUSE 1 second] Which number is missing? [PAUSE 2 seconds] Good practice." },
    { sceneOrder: 5, durationSeconds: 10, characterType: "animal", characterName: "Ollie", characterState: "showing numbers", visualAssetTag: "trial1_display", audioScript: "Look at these six numbers for two seconds. [PAUSE 2 seconds] One number is now hidden.", sourceText: "Look at these six numbers for two seconds. [PAUSE 2 seconds] One number is now hidden." },
    { sceneOrder: 6, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "asking question", visualAssetTag: "trial1_question", audioScript: "Which number is missing? Please tell me your answer.", sourceText: "Which number is missing? Please tell me your answer." },
    { sceneOrder: 7, durationSeconds: 10, characterType: "animal", characterName: "Ollie", characterState: "showing numbers", visualAssetTag: "trial2_display", audioScript: "Here are six new numbers. Watch closely for two seconds. [PAUSE 2 seconds] One is hidden now.", sourceText: "Here are six new numbers. Watch closely for two seconds. [PAUSE 2 seconds] One is hidden now." },
    { sceneOrder: 8, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "asking question", visualAssetTag: "trial2_question", audioScript: "What number did you see disappear? Say it out loud.", sourceText: "What number did you see disappear? Say it out loud." },
    { sceneOrder: 9, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "showing numbers", visualAssetTag: "trial3_display", audioScript: "Final set of six numbers. Watch for two seconds. [PAUSE 2 seconds]", sourceText: "Final set of six numbers. Watch for two seconds. [PAUSE 2 seconds]" },
    { sceneOrder: 10, durationSeconds: 5, characterType: "animal", characterName: "Ollie", characterState: "waving", visualAssetTag: "closing", audioScript: "Thank you for playing. Goodbye!", sourceText: "Thank you for playing. Goodbye!" },
  ],
};

export const sampleHindiStoryline: HindiStoryline = {
  ...sampleStoryline,
  language: "hi-IN",
  scenes: sampleStoryline.scenes.map((scene, index) => ({
    ...scene,
    translatedText: [
      "नमस्ते, मैं उल्लू ओली हूँ। मैं तुम्हें दो सेकंड के लिए छह संख्याएँ दिखाऊँगी।",
      "फिर, मैं एक नंबर छिपाऊँगी। आप गायब नंबर का नाम बताएँगी।",
      "इन नंबरों को देखो; [PAUSE 2 seconds]",
      "एक संख्या छिपी हुई है; [PAUSE 1 second] कौन सी संख्या गायब है? [PAUSE 2 seconds] अच्छा अभ्यास।",
      "इन छह नंबरों को दो सेकंड के लिए देखें। [PAUSE 2 seconds] एक संख्या अब छिपी हुई है।",
      "कौन सी संख्या गायब है? कृपया मुझे अपना उत्तर बताएं।",
      "यहाँ छह नए नंबर हैं। दो सेकंड के लिए ध्यान से देखें। [PAUSE 2 seconds] एक अब छिपा हुआ है।",
      "आपने कौन सा नंबर गायब होते देखा? ज़ोर से बोलिए।",
      "छह संख्याओं का अंतिम सेट। दो सेकंड के लिए देखें। [PAUSE 2 seconds]",
      "खेलने के लिए धन्यवाद। अलविदा!",
    ][index] ?? scene.audioScript,
  })),
};