# Shipping workflow

## Golden path

1. Initialize identity with `pnpm init:product`.
2. Complete `PRODUCT.md`; resolve the smallest promise, surfaces, states, data, permissions, denial behavior, and browser targets.
3. Choose a quality level and write outcome, boundaries, prototype applicability, and proof.
4. Follow `docs/PROTOTYPING.md`: map every requirement and build the complete functional HTML/Tailwind extension simulator.
5. Run `pnpm verify:prototype`, review every surface and state with the user, and revise until explicitly approved.
6. Record approval and pass `pnpm verify:prototype:approved`.
7. Extend the domain and application ports before wiring Chrome APIs.
8. Add the thinnest entrypoints needed for the approved vertical slice.
9. Run `pnpm check:fast`; compare production against prototype coverage, then inspect narrow/wide, keyboard, loading, denial, and failure states.
10. Reconcile manifest, permission ledger, privacy policy, store claims, and tests.
11. Run `pnpm check:release`; manually install the verified artifact before handoff.

## Weekly cadence

- Monday — select one user outcome, resolve its requirements, and remove permissions or features it does not require.
- Tuesday — build and review the functional extension prototype; entrypoint implementation waits for approval.
- Wednesday — implement the approved slice through all architectural seams.
- Thursday — compare against the prototype, then test browser lifecycle, accessibility, privacy, denial, update, and package behavior.
- Friday — package or release, observe real use, update the scorecard, and write the smallest useful postmortem.

## AI delegation matrix

| Work                                     | AI can proceed                                     | Human decision required                                             |
| ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Domain logic, adapters, tests, refactors | With bounded interfaces and objective proof        | Public protocol or architecture changes with migration cost         |
| Functional prototype                     | From resolved requirements and explicit mocks      | Approval, brand taste, positioning, or workflow trade-offs          |
| UI implementation                        | From an explicitly approved prototype              | Any material deviation from the approved experience                 |
| Permission-free feature work             | When data remains local and behavior is reversible | Any new permission, page access, collection, or transmission        |
| Dependency maintenance                   | Patch/minor updates with passing artifact proof    | Major versions, remote service, recurring cost, or vendor lock-in   |
| Release preparation                      | Local ZIP, checksum, notes, and verification       | Store upload, signing, credentials, publication, or remote metadata |

Use parallel agents only for independent read-only investigations or separated files. Keep permission decisions, product truth, and final artifact integration with one owner.

## Stop conditions

Pause for direction when requirements are unresolved, prototype approval is missing, or work needs a permission, host access, content script, network service, credential, paid resource, sensitive-data decision, store mutation, or irreversible action.
