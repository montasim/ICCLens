# Working agreement

This is a privacy-first Chrome extension product factory. Preserve its narrow Manifest V3 permission surface, vertical slice, deep module seams, generated assets, and artifact checks while adapting it.

## Start here

1. Read `PRODUCT.md`, `DESIGN.md`, `docs/ARCHITECTURE.md`, `permission-ledger.md`, and `docs/QUALITY.md`.
2. Run `pnpm init:product -- --name "Product name" --homepage "https://example.com"`.
3. Resolve one user promise, every required surface and state, and the smallest permission boundary that proves it.
4. For a new extension, user journey, surface, or material redesign, follow `docs/PROTOTYPING.md`. Build the functional HTML/Tailwind simulator, obtain explicit human approval, and pass `pnpm verify:prototype:approved` before production entrypoint implementation.
5. Add permissions only after updating `permission-ledger.md` with trigger, value, data access, denial behavior, and test proof.
6. Run `pnpm check:fast` during development and `pnpm check:release` before packaging.

## Architecture boundaries

- `src/domain/` contains pure product rules and types with no browser API imports.
- `src/application/` defines use cases and ports. It depends on the domain, never on Chrome.
- `src/infrastructure/` implements ports with Chrome APIs and owns serialization boundaries.
- `src/shared/protocol.ts` is the typed runtime-message contract.
- `entrypoints/` wires WXT lifecycle and presentation to application services.
- `src/components/ui/` contains reusable Shadcn-style primitives. Huge Icons is the only icon library.
- `product.config.json` owns public identity and release placeholders; generation scripts own derived assets.

## Code quality and modularity

- Apply clean-code and SOLID principles as design constraints: give each module one product-aligned reason to change, keep interfaces small, depend inward toward the domain, and keep adapters substitutable.
- Prefer deep modules that hide Chrome lifecycle, serialization, and error handling behind narrow interfaces. Add a seam for real variation or a side effect, not for hypothetical reuse.
- Keep domain and application functions focused, explicitly typed, and deterministic. Return results; keep storage, messaging, permissions, and browser lifecycle at the edge.
- Use discriminated state and message types instead of boolean combinations, unchecked casts, or implicit failure states.
- Test through application ports and user-visible entrypoints. A refactor is complete when domain, runtime protocol, manifest, and packaged behavior remain proven.

## WXT and Chrome MV3 rules

- Treat the background service worker as ephemeral. Durable truth belongs behind a storage port, not in module globals or timers.
- Keep required permissions minimal and capability-driven. Prefer user gestures and optional permissions; update the permission ledger before the manifest.
- Package all executable code with the extension. Remote code, `eval`, and runtime script loading are outside the architecture.
- Keep runtime messages typed and validate untrusted payloads at the background seam before product logic receives them.
- Use WXT entrypoints and configuration as the lifecycle and manifest authorities. Keep Chrome APIs in entrypoints or infrastructure adapters, never in domain or application modules.
- Treat a content script, host access, network service, synchronization, or sensitive storage as a threat-model and release-contract change with denial behavior and real-browser proof.

Read `docs/ARCHITECTURE.md` before changing module ownership, runtime messages, storage, permissions, or extension surfaces. Completion means its dependency direction and MV3 checks still hold.

## Skills

Before invoking a routed skill, confirm that the current AI provider has it. If it is missing, follow the GitHub/npm acquisition path in `docs/SKILLS.md` and report the missing capability; never claim a skill was used when it was unavailable.

## Security and privacy boundaries

- No content script, host permission, telemetry, remote font, or network request is included by default.
- Treat every permission as product scope. Prefer optional permissions and user-triggered grants when a future feature allows it.
- Never store secrets, access tokens, or sensitive page content in `chrome.storage.local` without a reviewed threat model.
- Validate runtime messages at the background boundary before adding messages that accept external or page-derived data.
- Do not weaken the release verifier to make a permission change pass; update the ledger and verifier deliberately.

## AI task contract

Every task states:

- Outcome: the observable extension behavior.
- Boundaries: entrypoints, permissions, data, dependencies, and behavior that must not change.
- Prototype: the approved coverage path, or why the prototype gate does not apply.
- Proof: unit, UI, browser, manifest, or packaged-artifact evidence.

AI may autonomously perform bounded, reversible work with objective proof. Ask for a decision before product positioning, permissions, data collection, third-party services, store submission, signing, credentials, payment, or irreversible remote actions.

## Definition of done

Code existing is not completion. The appropriate level in `docs/QUALITY.md` must pass, production surfaces must match the approved prototype or record an approved deviation, denial and failure paths must be intentional, manifest claims and privacy text must match behavior, and the exact ZIP shipped must pass the package verifier.
