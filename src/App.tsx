import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  AudioLines,
  Bird,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clapperboard,
  Clock3,
  FileText,
  FolderOpen,
  LockKeyhole,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { sampleHindiStoryline, sampleInstruction, sampleStoryline } from "./mockData";
import { validateStoryline, type AgeBand, type OutputLanguage, type PlanSection, type Scene, type Storyline } from "./scriptModel";
import "./workspace.css";

type WorkspaceTab = "script" | "outline" | "preview";
type PipelineStage = "Script" | "Approval" | "Translation" | "Voiceover" | "Visuals" | "Video";

const pipelineStages: PipelineStage[] = ["Script", "Approval", "Translation", "Voiceover", "Visuals", "Video"];

function distributeDuration<T extends { durationSeconds: number }>(items: T[], target: number): T[] {
  const originalTotal = items.reduce((sum, item) => sum + item.durationSeconds, 0);
  const adjusted = items.map((item) => ({ ...item, durationSeconds: Math.max(1, Math.round((item.durationSeconds / originalTotal) * target)) }));
  adjusted[adjusted.length - 1]!.durationSeconds += target - adjusted.reduce((sum, item) => sum + item.durationSeconds, 0);
  return adjusted;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function App() {
  const [instruction, setInstruction] = useState(sampleInstruction);
  const [ageBand, setAgeBand] = useState<AgeBand>(sampleStoryline.ageBand);
  const [duration, setDuration] = useState(sampleStoryline.targetDurationSeconds);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("hi-IN");
  const [storyline, setStoryline] = useState<Storyline>(() => structuredClone(sampleStoryline));
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("script");
  const [selectedSceneOrder, setSelectedSceneOrder] = useState(1);
  const [selectedSectionOrder, setSelectedSectionOrder] = useState(1);
  const [pipelineIndex, setPipelineIndex] = useState(1);
  const [approved, setApproved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const selectedScene = storyline.scenes.find((scene) => scene.sceneOrder === selectedSceneOrder) ?? storyline.scenes[0]!;
  const selectedSection = storyline.plannedSections.find((section) => section.sectionOrder === selectedSectionOrder) ?? storyline.plannedSections[0]!;
  const currentHindiStoryline = { ...sampleHindiStoryline, ageBand: storyline.ageBand, targetDurationSeconds: storyline.targetDurationSeconds };
  const translatedScene = currentHindiStoryline.scenes.find((scene) => scene.sceneOrder === selectedScene.sceneOrder);
  const validationErrors = validateStoryline(storyline);
  const isLocked = approved;
  const visibleSceneText = showSource ? selectedScene.sourceText : selectedScene.audioScript;
  const completedDuration = storyline.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);

  function patchScene<K extends keyof Scene>(key: K, value: Scene[K]) {
    if (isLocked) return;
    setStoryline((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.sceneOrder === selectedScene.sceneOrder ? { ...scene, [key]: value } : scene),
    }));
  }

  function patchSection<K extends keyof PlanSection>(key: K, value: PlanSection[K]) {
    if (isLocked) return;
    setStoryline((current) => ({
      ...current,
      plannedSections: current.plannedSections.map((section) => section.sectionOrder === selectedSection.sectionOrder ? { ...section, [key]: value } : section),
    }));
  }

  function patchTrial<K extends keyof NonNullable<Scene["trial"]>>(key: K, value: NonNullable<Scene["trial"]>[K]) {
    if (isLocked) return;
    setStoryline((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.sceneOrder === selectedScene.sceneOrder && scene.trial
        ? { ...scene, trial: { ...scene.trial, [key]: value } }
        : scene),
    }));
  }

  function addTrialMetadata() {
    if (isLocked) return;
    patchScene("trial", {
      trialNumber: 1,
      phase: "practice",
      displayNumbers: [3, 5, 7, 9, 2, 4],
      missingNumber: 9,
      displayDurationSeconds: 2,
      responseWindowSeconds: 5,
    });
  }

  function generateMockScript() {
    if (generating || instruction.trim().length === 0 || !Number.isInteger(duration) || duration < 60 || duration > 3600) return;
    setGenerating(true);
    setApproved(false);
    setPipelineIndex(1);
    window.setTimeout(() => {
      const plannedSections = distributeDuration(sampleStoryline.plannedSections, duration);
      const scenes = distributeDuration(sampleStoryline.scenes, duration);
      setStoryline({ ...structuredClone(sampleStoryline), ageBand, targetDurationSeconds: duration, plannedSections, scenes });
      setSelectedSceneOrder(1);
      setPipelineIndex(1);
      setGenerating(false);
    }, 550);
  }

  function saveApproval() {
    if (validationErrors.length > 0) return;
    setApproved(true);
    setPipelineIndex(2);
  }

  function unlockScript() {
    setApproved(false);
    setPipelineIndex(1);
  }

  function downloadStoryline() {
    const file = new Blob([JSON.stringify(storyline, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "balvibe-storyline.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function advancePipeline() {
    setPipelineIndex((index) => Math.min(index + 1, pipelineStages.length - 1));
  }

  function sectionForScene(sceneOrder: number): PlanSection {
    const elapsed = storyline.scenes.filter((scene) => scene.sceneOrder < sceneOrder).reduce((sum, scene) => sum + scene.durationSeconds, 0);
    let boundary = 0;
    return storyline.plannedSections.find((section) => {
      boundary += section.durationSeconds;
      return elapsed < boundary;
    }) ?? storyline.plannedSections.at(-1)!;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#workspace" aria-label="BalVibe home">
          <span className="brand-mark"><span /></span>
          <span>balvibe<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-monogram">CB</span>
          <span className="workspace-label"><strong>Child Behaviour Lab</strong><small>Research workspace</small></span>
          <ChevronDown size={15} />
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#experiments" className="nav-item"><FolderOpen size={17} />Experiments<span className="nav-count">4</span></a>
          <a href="#workspace" className="nav-item selected"><FileText size={17} />Script review</a>
          <a href="#pipeline" className="nav-item"><Workflow size={17} />Generation pipeline</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-link"><CircleHelp size={16} /><span>Help & feedback</span></div>
          <div className="user-chip"><span className="user-avatar">AM</span><span><strong>Dr. Ananya Mehta</strong><small>Researcher</small></span><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main id="workspace" className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Experiments</span><ChevronRight size={14} /><strong>Number memory study</strong></div>
          <div className="topbar-actions"><span className="autosave"><span />Saved just now</span><button className="icon-button" title="Download storyline JSON" aria-label="Download storyline JSON" onClick={downloadStoryline}><ArrowDownToLine size={17} /></button><button className="avatar-button" aria-label="Account menu">AM</button></div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <a className="back-link" href="#experiments"><ArrowLeft size={14} /> All experiments</a>
              <div className="title-row"><h1>Number memory study</h1><span className={`status-pill ${approved ? "approved" : "draft"}`}>{approved ? <><LockKeyhole size={12} /> Approved</> : "Draft review"}</span></div>
              <p className="page-subtitle">Experiment brief, child-facing script, and production status.</p>
            </div>
            <button className="secondary-button" onClick={downloadStoryline}><ArrowDownToLine size={15} /> Export JSON</button>
          </div>

          <section className="creation-panel" aria-labelledby="creation-title">
            <div className="creation-intro">
              <div className="section-kicker"><span className="kicker-icon"><Sparkles size={14} /></span>EXPERIMENT SETUP</div>
              <div className="creation-title-row"><h2 id="creation-title">Brief the activity</h2><span className="mock-label">MOCK WORKFLOW</span></div>
              <p>Set the child age and delivery language. The generated source script remains English.</p>
            </div>
            <div className="creation-fields">
              <label className="brief-field"><span>Researcher instructions</span><textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} disabled={isLocked} rows={3} /></label>
              <div className="setup-controls">
                <label><span>Age group</span><select value={ageBand} onChange={(event) => setAgeBand(event.target.value as AgeBand)} disabled={isLocked}><option value="4-5">4–5 years</option><option value="6-8">6–8 years</option><option value="9-11">9–11 years</option></select></label>
                <label><span>Duration</span><div className="input-suffix"><input type="number" min={60} max={3600} step={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} disabled={isLocked} /><span>sec</span></div></label>
                <label><span>Output language</span><select value={outputLanguage} onChange={(event) => setOutputLanguage(event.target.value as OutputLanguage)} disabled={isLocked}><option value="en-US">English · US</option><option value="hi-IN">Hindi · India</option></select></label>
                <button className="generate-button" onClick={generateMockScript} disabled={generating || isLocked || instruction.trim().length === 0 || !Number.isInteger(duration) || duration < 60 || duration > 3600}>
                  {generating ? <span className="button-spinner" /> : <WandSparkles size={16} />}{generating ? "Generating" : "Generate script"}
                </button>
              </div>
              {duration < 60 || duration > 3600 || !Number.isInteger(duration) ? <p className="field-error">Use a whole duration from 60 to 3600 seconds.</p> : null}
            </div>
          </section>

          <section className="summary-row" aria-label="Experiment details">
            <div className="summary-item"><span className="summary-label">AGE BAND</span><strong>{storyline.ageBand} years</strong></div>
            <div className="summary-item"><span className="summary-label">TARGET LENGTH</span><strong>{formatDuration(storyline.targetDurationSeconds)}</strong></div>
            <div className="summary-item"><span className="summary-label">PLANNED SECTIONS</span><strong>{storyline.plannedSections.length} <small>sections</small></strong></div>
            <div className="summary-item"><span className="summary-label">SCRIPT SCENES</span><strong>{storyline.scenes.length} <small>scenes</small></strong></div>
            <div className="summary-item character-summary"><span className="summary-label">LEAD CHARACTER</span><strong><span className="tiny-bird"><Bird size={14} /></span>{storyline.scenes[0]?.characterName}</strong></div>
          </section>

          <section id="pipeline" className="pipeline-panel" aria-label="Production pipeline">
            <div className="pipeline-head"><div><div className="section-kicker">PRODUCTION</div><h2>Generation pipeline</h2></div><span className="pipeline-next">{pipelineIndex === 5 ? "Complete" : `Next: ${pipelineStages[Math.min(pipelineIndex, 5)]}`}</span></div>
            <div className="pipeline-track">
              {pipelineStages.map((stage, index) => {
                const Icon = [FileText, CheckCircle2, AudioLines, AudioLines, Sparkles, Clapperboard][index]!;
                const state = index < pipelineIndex ? "complete" : index === pipelineIndex ? "current" : "upcoming";
                return <div className={`pipeline-step ${state}`} key={stage}><span className="pipeline-icon">{state === "complete" ? <Check size={15} /> : <Icon size={15} />}</span><span>{stage}</span></div>;
              })}
            </div>
            <div className="pipeline-footer"><span>{pipelineIndex < 2 ? "Review and approve the English source before continuing." : pipelineIndex < 5 ? "Mock progress only. No translation, speech, or visual services are connected." : "The mock video preview is ready to review."}</span>
              {approved ? <button className="pipeline-action" onClick={advancePipeline} disabled={pipelineIndex >= 5}>{pipelineIndex === 5 ? "Preview ready" : `Run mock ${pipelineStages[pipelineIndex]?.toLowerCase()}`}<ChevronRight size={15} /></button> : <span className="approval-reminder"><LockKeyhole size={13} /> Researcher approval required</span>}
            </div>
          </section>

          <div className="workspace-heading-row">
            <div><div className="section-kicker">SCRIPT WORKSPACE</div><h2>Review your experiment</h2></div>
            <div className="workspace-actions">
              {approved ? <button className="secondary-button" onClick={unlockScript}>Unlock to edit</button> : <button className="approve-button" onClick={saveApproval} disabled={validationErrors.length > 0}><CheckCircle2 size={16} />Approve & lock</button>}
            </div>
          </div>
          {validationErrors.length > 0 ? <div className="validation-note">The storyline has {validationErrors.length} validation issue{validationErrors.length === 1 ? "" : "s"}. Review required fields before approval.</div> : null}

          <div className="tab-bar" role="tablist" aria-label="Script workspace views">
            <button className={activeTab === "script" ? "active" : ""} role="tab" aria-selected={activeTab === "script"} onClick={() => setActiveTab("script")}><FileText size={15} />Script <span>{storyline.scenes.length}</span></button>
            <button className={activeTab === "outline" ? "active" : ""} role="tab" aria-selected={activeTab === "outline"} onClick={() => setActiveTab("outline")}><Workflow size={15} />Plan <span>{storyline.plannedSections.length}</span></button>
            <button className={activeTab === "preview" ? "active" : ""} role="tab" aria-selected={activeTab === "preview"} onClick={() => setActiveTab("preview")}><Clapperboard size={15} />Video preview {pipelineIndex === 5 ? <span className="ready-dot" /> : <span className="soon-tag">MOCK</span>}</button>
          </div>

          {activeTab === "script" ? <section className="script-workspace" role="tabpanel">
            <div className="scene-list-pane">
              <div className="pane-heading"><div><span className="summary-label">STORYBOARD</span><h3>Scene sequence</h3></div><button className="small-icon-button" title="Add a scene" aria-label="Add a scene" disabled={isLocked} onClick={() => {
                const nextOrder = storyline.scenes.length + 1;
                const scene: Scene = { sceneOrder: nextOrder, durationSeconds: 5, characterType: "animal", characterName: storyline.scenes[0]?.characterName ?? "Ollie", characterState: "waiting", visualAssetTag: "new_scene", audioScript: "Add child-facing narration.", sourceText: "Add source text." };
                setStoryline((current) => ({ ...current, scenes: [...current.scenes, scene] }));
                setSelectedSceneOrder(nextOrder);
              }}><Plus size={15} /></button></div>
              <div className="scene-list">
                {storyline.scenes.map((scene) => {
                  const section = sectionForScene(scene.sceneOrder);
                  return <button key={scene.sceneOrder} className={`scene-card ${selectedScene.sceneOrder === scene.sceneOrder ? "selected" : ""}`} onClick={() => setSelectedSceneOrder(scene.sceneOrder)}>
                    <span className="scene-number">{String(scene.sceneOrder).padStart(2, "0")}</span>
                    <span className="scene-card-copy"><strong>{section.title}</strong><small>{scene.visualAssetTag.replaceAll("_", " ")}</small></span>
                    <span className="scene-time">{scene.durationSeconds}s</span>
                  </button>;
                })}
              </div>
              <div className="scene-list-foot"><Clock3 size={13} />{formatDuration(completedDuration)} total scene time</div>
            </div>

            <div className="editor-pane">
              <div className="editor-topline"><div><span className="summary-label">SCENE {String(selectedScene.sceneOrder).padStart(2, "0")} / {String(storyline.scenes.length).padStart(2, "0")}</span><h3>{sectionForScene(selectedScene.sceneOrder).title}</h3></div><div className="editor-controls"><span className="scene-duration"><Clock3 size={13} />{selectedScene.durationSeconds}s</span><button className="small-icon-button" title="Scene options" aria-label="Scene options"><MoreHorizontal size={16} /></button></div></div>
              <div className="language-line"><span className="language-label">SCRIPT TEXT</span><div className="language-toggle"><button className={!showSource ? "selected" : ""} onClick={() => setShowSource(false)}>Narration</button><button className={showSource ? "selected" : ""} onClick={() => setShowSource(true)}>Source text</button></div></div>
              <label className="narration-field"><span className="visually-hidden">{showSource ? "Source text" : "Audio script narration"}</span><textarea value={visibleSceneText} onChange={(event) => patchScene(showSource ? "sourceText" : "audioScript", event.target.value)} disabled={isLocked} rows={5} /></label>
              {outputLanguage === "hi-IN" && pipelineIndex >= 2 && translatedScene ? <div className="translation-preview"><div className="translation-head"><span>HI-IN MOCK TRANSLATION</span><span>PREVIEW</span></div><p>{translatedScene.translatedText}</p></div> : null}
              <details className="scene-details" open>
                <summary>Scene details <ChevronDown size={14} /></summary>
                <div className="metadata-grid">
                  <label><span>Character type</span><select value={selectedScene.characterType} onChange={(event) => patchScene("characterType", event.target.value as Scene["characterType"])} disabled={isLocked}><option value="animal">Animal</option><option value="robot">Robot</option><option value="creature">Creature</option></select></label>
                  <label><span>Character name</span><input value={selectedScene.characterName} onChange={(event) => patchScene("characterName", event.target.value)} disabled={isLocked} /></label>
                  <label><span>Character state</span><input value={selectedScene.characterState} onChange={(event) => patchScene("characterState", event.target.value)} disabled={isLocked} /></label>
                  <label><span>Visual asset tag</span><input value={selectedScene.visualAssetTag} onChange={(event) => patchScene("visualAssetTag", event.target.value)} disabled={isLocked} /></label>
                  <label><span>Scene duration · seconds</span><input type="number" min="0.1" step="0.1" value={selectedScene.durationSeconds} onChange={(event) => patchScene("durationSeconds", Number(event.target.value))} disabled={isLocked} /></label>
                </div>
                {selectedScene.trial ? <div className="trial-fields">
                  <div className="trial-heading"><span>TRIAL METADATA</span><button className="text-button" onClick={() => patchScene("trial", undefined)}>Remove metadata</button></div>
                  <div className="metadata-grid trial-grid">
                    <label><span>Trial number</span><input type="number" min="1" step="1" value={selectedScene.trial.trialNumber} onChange={(event) => patchTrial("trialNumber", Number(event.target.value))} disabled={isLocked} /></label>
                    <label><span>Phase</span><select value={selectedScene.trial.phase} onChange={(event) => patchTrial("phase", event.target.value as NonNullable<Scene["trial"]>["phase"])} disabled={isLocked}><option value="demonstration">Demonstration</option><option value="practice">Practice</option><option value="formal">Formal</option></select></label>
                    <label><span>Display numbers</span><input value={selectedScene.trial.displayNumbers.join(", ")} onChange={(event) => patchTrial("displayNumbers", event.target.value.split(",").map((number) => Number(number.trim())).filter(Number.isFinite))} disabled={isLocked} /></label>
                    <label><span>Missing number</span><input type="number" step="1" value={selectedScene.trial.missingNumber} onChange={(event) => patchTrial("missingNumber", Number(event.target.value))} disabled={isLocked} /></label>
                    <label><span>Display duration · sec</span><input type="number" min="0.1" step="0.1" value={selectedScene.trial.displayDurationSeconds} onChange={(event) => patchTrial("displayDurationSeconds", Number(event.target.value))} disabled={isLocked} /></label>
                    <label><span>Response window · sec</span><input type="number" min="0.1" step="0.1" value={selectedScene.trial.responseWindowSeconds} onChange={(event) => patchTrial("responseWindowSeconds", Number(event.target.value))} disabled={isLocked} /></label>
                  </div>
                </div> : <div className="trial-empty"><p>No trial metadata on this scene. Practice and formal trial instructions may be represented in the plan instead.</p><button className="text-button" onClick={addTrialMetadata} disabled={isLocked}><Plus size={12} />Add trial metadata</button></div>}
              </details>
              <div className="editor-footer"><span>{isLocked ? <><LockKeyhole size={13} /> Script locked after researcher approval</> : <><span className="saved-indicator" /> Changes are local to this preview</>}</span><span>{visibleSceneText.length} characters</span></div>
            </div>
          </section> : null}

          {activeTab === "outline" ? <section className="outline-view" role="tabpanel">
            <div className="outline-intro"><span className="summary-label">PLANNED SECTIONS</span><p>Section plan is separate from scenes; practice and formal trial details can live here even when a scene has no trial object.</p></div>
            <div className="outline-grid">
              <div className="outline-list">{storyline.plannedSections.map((section) => <button className={`outline-item ${selectedSection.sectionOrder === section.sectionOrder ? "selected" : ""}`} key={section.sectionOrder} onClick={() => setSelectedSectionOrder(section.sectionOrder)}><span>{String(section.sectionOrder).padStart(2, "0")}</span><div><strong>{section.title}</strong><small>{section.durationSeconds} seconds</small></div><ChevronRight size={15} /></button>)}</div>
              <div className="outline-editor">
                <div className="outline-editor-head"><span className="summary-label">SECTION {String(selectedSection.sectionOrder).padStart(2, "0")}</span><span className="scene-duration"><Clock3 size={13} />{selectedSection.durationSeconds}s</span></div>
                <label><span>Title</span><input value={selectedSection.title} onChange={(event) => patchSection("title", event.target.value)} disabled={isLocked} /></label>
                <label><span>Purpose</span><textarea rows={2} value={selectedSection.purpose} onChange={(event) => patchSection("purpose", event.target.value)} disabled={isLocked} /></label>
                <label><span>Required content · one item per line</span><textarea rows={6} value={selectedSection.requiredContent.join("\n")} onChange={(event) => patchSection("requiredContent", event.target.value.split("\n"))} disabled={isLocked} /></label>
                <label><span>Duration · seconds</span><input type="number" min="0.1" step="0.1" value={selectedSection.durationSeconds} onChange={(event) => patchSection("durationSeconds", Number(event.target.value))} disabled={isLocked} /></label>
              </div>
            </div>
          </section> : null}

          {activeTab === "preview" ? <section className="video-view" role="tabpanel">
            <div className="video-toolbar"><div><span className="summary-label">VIDEO COMPOSITION</span><h3>{pipelineIndex === 5 ? "Mock render ready" : "Preview frame"}</h3></div><span className={`render-state ${pipelineIndex === 5 ? "ready" : "waiting"}`}><span />{pipelineIndex === 5 ? "Ready to review" : "Waiting for visual generation"}</span></div>
            <div className="video-stage"><div className="video-paper-grain" /><div className="video-caption"><span>NUMBER MEMORY · SCENE {String(selectedScene.sceneOrder).padStart(2, "0")}</span><h3>{selectedScene.audioScript.split(/[.!?]/)[0]}</h3></div><div className="video-character"><div className="owl-face"><Bird size={64} strokeWidth={1.3} /></div><span>{selectedScene.characterName}</span></div><div className="number-board"><span>4</span><span>7</span><span>9</span><span className="hidden-number">?</span><span>2</span><span>5</span></div><div className="video-control-row"><button aria-label={playing ? "Pause preview" : "Play preview"} onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</button><div className="mock-progress"><span style={{ width: playing ? "62%" : "18%" }} /></div><span>{formatDuration(selectedScene.durationSeconds)}</span><span className="preview-watermark">MOCK PREVIEW</span></div></div>
            <div className="preview-note"><span><Clapperboard size={15} /> Visuals, audio, and composition are placeholders.</span><span>{storyline.scenes.length} scenes · {formatDuration(storyline.targetDurationSeconds)}</span></div>
          </section> : null}

          <footer className="page-foot"><span>Source contract: Week 1 storyline format · Frontend-only mock</span><button onClick={downloadStoryline}><ArrowDownToLine size={14} /> Download JSON</button></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
