# 数学生长地图

Buildless, browser-local primary mathematics knowledge atlas. Deployment identity: `.openai/hosting.json`.

- `dist/`: independently authored curriculum inventory, task banks and client app.
- 230 knowledge nodes, all 6 grades and 12 reference terms, 5 navigation blocks.
- 216 task-scoped relations. Necessary relations explicitly name their target task; pedagogical validation is pending.
- 12 diagnostic anchors across all 5 blocks, 216 first-round tasks, 216 alternative tasks, 12 delayed review tasks.
- Three task tiers, 8 ability directions, objective numerical checks plus explicitly labelled rubric self-checks.
- Separate local profiles and backup import/export; no student data is sent to a server.

## Validation

`node --check dist/app.js`

`node scripts/check.mjs`

Preview with the managed `sites-preview` command. Native browser QA completed: loading, all-grade navigation, creating a profile, pause/reload/resume, independent first-tier completion and node color, tier feedback. Mobile layout uses responsive CSS; a physical iOS device has not been tested.

## Content generation

The committed `dist/data.json` is authoritative. To rebuild the current inventory, run these once in order:

1. `python scripts/make-data.py`
2. `python scripts/make-training.py`
3. `python scripts/extend-data.py`
4. `python scripts/add-variants.py`
5. `python scripts/expand-grades.py`

Then run validation. The scripts after step 1 expect the previous output. Keep all knowledge identifiers stable when evolving the data to preserve student records.

## Content boundaries

Reference grade and term assignments are provisional pending line-by-line alignment with the BNU 2024-onward revised series. No unverified textbook page numbers are provided. The scope is the major primary knowledge structure, not a certified exhaustive official directory. Curriculum source links and modelling boundaries are available in the app's help panel.

Rubric self-checks do not automatically evaluate free-text meaning. Colors represent consecutive passed task tiers, not psychometrically validated global ability levels. Hints and edits after answer reveal prevent an attempt being recorded as independent. Fresh alternate tasks provide a second independent check. Delayed review is explicitly labelled and never substitutes for completing all six tasks of a tier.
