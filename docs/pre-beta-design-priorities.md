# ShelfPick pre-beta design priorities

Updated: 24 September 2026

Priority: pre-beta design and proposition pass, requested by Tom on 24 September 2026. Status: planned, not implemented. Keep existing release safeguards and completed functionality. Current engineering roadmap takes precedence over stale README descriptions. Pro is currently a one-time unlock; price is undecided. Do not introduce a subscription or paid checkout as part of this design pass.

## Delivery order and scope

These three workstreams are the current product priority before beta/public launch. Pause unrelated feature expansion. First compare visual directions and select the logo; audit Pro value in parallel as a workstream; then implement shared UI foundations, core screens, approved assets and the Pro presentation. Work one implementation slice at a time. Product design approval remains with Tom.

Keep production configuration, endpoint hardening, observability, email/migration/recovery verification and recommendation correctness as separate release gates. These priorities do not certify beta readiness or supersede the production runbook. Billing is not required for the design pass or private beta.

## Source reconciliation

The repository ROADMAP.md and current ProComparisonView specify a one-time Pro unlock with price undecided. Older Notion monthly pricing and the archived commercial roadmap's monthly/annual prices are historical. Preserve the current one-off direction until an explicit product decision changes it. The README's Game Night preview and older delivery order are stale relative to the engineering roadmap; verify live capabilities during the audit rather than inferring availability from those descriptions.

## ShelfPick — UI and layout redesign

Priority: pre-beta design and proposition pass, requested by Tom on 24 September 2026. Status: planned, not implemented. Keep existing release safeguards and completed functionality. Current engineering roadmap takes precedence over stale README descriptions. Pro is currently a one-time unlock; price is undecided. Do not introduce a subscription or paid checkout as part of this design pass.

## Goal
Make ShelfPick feel like a polished board-game companion and make choosing a game the obvious main task.

## Actions
1. Capture current mobile and desktop screens for Picker setup, shortlist, reveal, Collection, Discover, Game Night, Insights, Settings and Pro. Record actual usability problems; do not assume older screenshots still match.
2. Compare two coherent directions using the same Picker, Collection and Pro screens: warm tabletop (cream, forest green, amber, restrained editorial headings) and clean contemporary (neutral surfaces, compact controls, artwork-led cards). Include dark mode in both.
3. Choose a direction before changing shared styles. Reuse the existing design tokens and components.
4. Simplify Picker to essential inputs first: players, time and complexity; make optional filters a disclosure. Compare this against the existing guided flow and preserve useful defaults and exact-player-count suitability.
5. Establish one primary action per screen. Present a readable 3–5-game shortlist, with artwork, player/time fit and short reasons; make selection/reveal and recording a play clear.
6. Give Collection and Discover consistent card anatomy, predictable artwork sizes, readable metadata and persistent filters. Use space and typography to separate sections rather than wrapping everything in cards.
7. Use a compact mobile navigation and a bounded desktop layout. Keep settings/profile secondary. Preserve routes, browser Back, collection state and scroll restoration.
8. Apply approved design in small slices: shell and tokens; Picker/shortlist/reveal; Collection/Discover; remaining screens. Implement the Pro screen after its proposition is agreed.

## Deliverables
Two comparable visual directions; chosen mobile/desktop light/dark reference screens; updated DESIGN.md and docs/design-system.md after approval; scoped implementation tasks.

## Done when
Tom approves the look; primary actions are obvious; no horizontal overflow at 360/390/768/1280px; keyboard/focus/contrast/reduced-motion checks pass; loading, error, empty and sparse-data states are designed; existing core journeys and state restoration remain intact. Run affected tests and the required repository validation once per implementation slice.

## Separate-chat starter
Work on ShelfPick's UI and layout priority. Read ROADMAP.md, DESIGN.md and docs/pre-beta-design-priorities.md plus applicable AGENTS.md. Start by reviewing current screens and producing two visual directions for Picker, Collection and Pro in mobile/desktop and light/dark. Recommend one with concrete layout improvements. Keep this first task focused on design selection; implement the selected direction in small follow-up slices. Preserve existing recommendation rules, routing and saved state.

---

## ShelfPick — Logo and brand correction

Priority: pre-beta design and proposition pass, requested by Tom on 24 September 2026. Status: planned, not implemented. Keep existing release safeguards and completed functionality. Current engineering roadmap takes precedence over stale README descriptions. Pro is currently a one-time unlock; price is undecided. Do not introduce a subscription or paid checkout as part of this design pass.

## Goal
Choose one approved ShelfPick identity and ensure every app and public-facing surface uses it consistently.

## Concepts to compare
1. The Cozy Shelf: board-game boxes and a yellow meeple on a forest-green shelf icon. Closest to the previously preferred direction.
2. The Chosen Game: one highlighted box tilted out of a shelf. More directly communicates choosing what to play.
3. Game Night: a simple S-shaped shelf with a meeple. Strongest compact monogram direction.

The generated concept board is exploration, not approved production artwork. Recommendation: start with 1 for continuity; compare 2 if picking needs stronger emphasis.

## Actions
1. Inventory the actual logo sources and references: BrandLogo, header, login/onboarding, favicon, PWA manifest, Apple touch icon, social sharing and landing assets.
2. Compare the three concepts at realistic small sizes and in light/dark contexts. Obtain Tom's choice of concept and wordmark before replacing assets.
3. Refine the chosen mark into a clean editable vector master with fewer details. Produce icon-only, horizontal wordmark, monochrome and light/dark versions.
4. Export assets to the dimensions required by the existing manifest and integration points; include maskable safe areas and social avatar crops. Record exact approved filenames and usage rules.
5. Replace references consistently, regenerate required PWA assets, and verify an installed app update so stale cached icons are not mistaken for a failed replacement.

## Deliverables
Approved SVG master; PNG exports; icon-only and wordmark variants; short brand usage record; asset inventory and implementation checklist.

## Done when
The mark is recognisable at 24/32/48px; the favicon remains readable at 16px; no old logo references remain on active surfaces; light/dark contrast and cropping work; installed PWA, browser and social preview checks use the correct asset.

## Separate-chat starter
Work on ShelfPick's logo priority. Compare the Cozy Shelf, Chosen Game and Game Night concepts from the 24 September design plan. I previously preferred the green shelf and yellow meeple direction. Inspect the currently used assets and explain why the app differs from the intended logo. Refine the options and help me choose one, then produce a single approved asset set and replace all active references, including favicon and PWA icons. Do not treat a generated concept board as the final production master.

---

## ShelfPick — Free vs Pro proposition and upgrade design

Priority: pre-beta design and proposition pass, requested by Tom on 24 September 2026. Status: planned, not implemented. Keep existing release safeguards and completed functionality. Current engineering roadmap takes precedence over stale README descriptions. Pro is currently a one-time unlock; price is undecided. Do not introduce a subscription or paid checkout as part of this design pass.

## Goal
Make Free feel complete and useful, while Pro offers concrete additional outcomes that users can understand and value.

## Verified planning baseline
The current ROADMAP.md marks Core Picker, Game Night MVP, Discover v3 and onboarding complete. ProComparisonView currently marks For You as included and advanced recommendations, enhanced Game Night and richer statistics as planned. Verify those claims against current behavior before writing the final offer. Basic Game Night is available to Free beta accounts. Attendee-linked collections are conditional; the roadmap documents a host-collection fallback.

## Actions
1. Audit every comparison row against working frontend behavior and backend entitlements. Produce a single feature matrix with Free/Pro entitlement, implemented/preview/planned status and evidence.
2. Keep collection/imports, Want to Play, core Picker and trustworthy suitability, basic play logging, Hot/Top 500 and essential data safety useful on Free. Preserve basic Game Night's current beta access; decide any post-beta entitlement explicitly.
3. Centre the immediate Pro story on working personalised Discover: find games that fit your collection and usual play habits, with understandable reasons. Check its sparse-history fallback so new users are not promised personalisation the data cannot support.
4. Assess three future value pillars: smarter personal choices, better decisions for recurring groups, and deeper understanding of the collection. These are candidates, not claims that all are available. If the working benefit is insufficient, define one small demonstrable improvement instead of adding many speculative features.
5. Design the page in this order: outcome-led headline; an example of the working benefit; concise Free/Pro cards; short feature comparison; clear one-off price once agreed; honest purchase/preview action; FAQ.
6. Keep planned features in a separate future section, excluded from the current purchase justification. Replace a dead upgrade button with a useful preview action, or an interest action only when its behavior exists.
7. Use contextual prompts at relevant moments (For You, advanced insights), with a clear way back to Free. Avoid interrupting the first successful pick.
8. Confirm the one-off price and scope of the unlock. Older £3.99 monthly, £1.99 monthly and £14.99 annual proposals are historical and must not be reused automatically. Checkout and ongoing subscription work are outside this design task.
9. Test comprehension with 5 target users: can at least 4 explain what Free includes, name one Pro benefit available now and understand the payment model? Treat this as a usability target, not statistical proof of demand. Capture willingness to pay and reasons for hesitation.

## Deliverables
Evidence-backed entitlement matrix; agreed value proposition; mobile/desktop upgrade-page designs; contextual prompt copy; price decision record; small follow-up implementation tasks.

## Done when
No available/planned ambiguity; one-off wording is consistent across app/docs/Notion; all advertised paid benefits can be demonstrated; Free remains usable; preview and return paths work; final price and purchase behavior are explicit before charging. Existing backend entitlement enforcement is retained and tested for any changed boundary.

## Separate-chat starter
Work on ShelfPick's Free vs Pro priority. Read the current ROADMAP.md, ProComparisonView and entitlement checks. The current product direction is a one-time Pro unlock with price undecided. First audit working versus planned benefits, then propose a concise value proposition, feature matrix and redesigned upgrade page. Keep core Free features useful. Show real examples of Pro value and keep future promises separate. Recommend the smallest improvement if the current working offer is too thin. Do not add checkout or silently change to subscriptions.

## Checkpoints

- [ ] Current screens and entitlement behavior audited.
- [ ] UI direction and logo chosen by Tom.
- [ ] Pro matrix, value proposition and price decision agreed.
- [ ] Shared visual foundations and core screens implemented.
- [ ] Logo references and PWA exports verified.
- [ ] Pro presentation and contextual prompts implemented.
- [ ] Five-user comprehension check completed; issues resolved.
- [ ] Existing operational beta gates passed before inviting testers.
