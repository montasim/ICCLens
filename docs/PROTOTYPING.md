# Functional prototype gate

The prototype is the approval boundary between resolved extension requirements and production implementation. It proves the complete user-visible experience cheaply; it does not replace WXT, Manifest V3, permission, protocol, storage, or package design.

## When the gate applies

Use this gate for a new derived extension, a new user journey or extension surface, or a material redesign. A refactor, dependency update, documentation change, or behavior-preserving bug fix can cite why the existing approved prototype remains sufficient.

Requirements are resolved when `PRODUCT.md` names the promise, audience, primary action, scope, non-goals, evidence limits, required surfaces, meaningful states, data categories, permissions, denial behavior, and browser targets. Pause for a product decision when any of those would materially change the prototype.

## Required artifacts

Create:

- `prototype/index.html` as a browser-based simulator;
- `prototype/coverage.md`, copied from `prototype/coverage.template.md`;
- optional `prototype/prototype.js` and local image assets.

Every requirement, entrypoint, permission interaction, and planned production state must have a row in the coverage table. Keep mock boundaries explicit so a simulated Chrome capability is not mistaken for implemented behavior.

## Implementation contract

- Use semantic HTML and Tailwind CSS 4 utility classes for every visual decision.
- Load the Tailwind 4 browser build with `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`.
- Keep the prototype free of CSS files, `<style>` blocks, inline style attributes, CSS-in-JS, and script-written styles. Toggle Tailwind classes or semantic attributes for visual state.
- Use minimal plain JavaScript for interaction and mock state. Do not call Chrome APIs, request permissions, persist real browsing data, contact services, authenticate, collect analytics, or mutate accounts.
- Make every visible control work. Simulate messages, storage, permissions, browser lifecycle, network outcomes, and external effects with explicit success, failure, denial, and recovery states.
- Represent every planned surface at realistic dimensions: action popup, side panel, options, onboarding, permission request, or recovery view when each is in scope.
- Cover keyboard navigation, focus behavior, reduced-motion expectations, high zoom, narrow and wide panels, and meaningful loading, empty, saving, saved, denied, and failed states.

The Tailwind browser build is a prototype dependency only. It must not enter the packaged extension or weaken its content-security, network, or permission baseline.

## Review loop

1. Map every resolved requirement into `prototype/coverage.md` before styling.
2. Build the complete extension journey and expose every planned state through visible controls or a review switcher.
3. Run `pnpm verify:prototype`.
4. Review popup, narrow and wide side-panel, and any other planned dimensions; then complete the keyboard path and inspect each state.
5. Present the prototype, coverage table, screenshots, permission simulations, and mock boundaries to the user.
6. Revise until the user explicitly approves the experience.
7. Record `Prototype status: approved`, the human approver, and the approval date.
8. Run `pnpm verify:prototype:approved`.
9. Create the production implementation plan across domain, application, protocol, adapter, entrypoint, manifest, and test seams.

Only the human user can approve the prototype. An agent may record an approval the user has explicitly given; it may not infer or self-grant approval.

## Completion criterion

The gate is complete when every requirement maps to a working surface or state, every control has observable behavior, dimensions and keyboard paths have review evidence, mock and permission boundaries are named, and `pnpm verify:prototype:approved` passes.

Production implementation preserves the approved outcome, not the throwaway code. Any material difference discovered during implementation returns to prototype review and requires approval in `prototype/coverage.md` before production behavior changes.
