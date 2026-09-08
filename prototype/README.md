# Prototype workspace

This directory is the approval gate between resolved requirements and production implementation. For a derived extension:

1. Copy `coverage.template.md` to `coverage.md` and map every user-visible requirement and extension surface.
2. Create `index.html` with semantic HTML and Tailwind CSS 4 utility classes.
3. Use minimal JavaScript to simulate popup, side-panel, options, onboarding, permission, storage, and failure behavior when those surfaces are in scope.
4. Run `pnpm verify:prototype`, review the prototype in a browser, and revise it with the user.
5. Record explicit human approval, then run `pnpm verify:prototype:approved` before changing production entrypoints.

Prototype files are review artifacts. Production code must implement the approved behavior through domain, application, protocol, adapter, and WXT seams instead of importing prototype code.
