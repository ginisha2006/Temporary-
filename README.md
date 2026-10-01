# BalVibe Researcher Frontend

Standalone researcher workbench for experiment setup, script review, section editing, approval, pipeline status, and a mock video preview.

## Run locally

```powershell
npm install
npm run dev
```

Build and lint with `npm run build` and `npm run lint`.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The Vite base path is set to `/Temporary-/` during Actions builds for `ginisha2006/Temporary-`.

## Data compatibility

`src/scriptModel.ts` mirrors the Week 1 `Storyline`, `Scene`, `PlanSection`, `Trial`, and Hindi storyline shapes. It also models the later `pipeline-result.json` additions (`approvedByResearcher`, `audioFile`, and `audioDurationMs`). The seed data in `src/mockData.ts` follows the saved Week 1 English and Hindi storyline examples, including scenes without optional trial metadata.

All generation, approval, translation, voiceover, visual, and video behavior in this module is local mock behavior. It contains no backend, model provider, API credentials, or service calls.
