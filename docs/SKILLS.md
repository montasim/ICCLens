# Skill routing

Skills are optional agent capabilities, not hidden project dependencies. The canonical catalog is [montasim/skills](https://github.com/montasim/skills), and every skill below is independently available from GitHub and npm.

## Availability first

Before invoking a skill:

1. Inspect the current AI provider's available skills and match the exact canonical name.
2. If it is installed, read its complete `SKILL.md` and follow its instructions.
3. If it is absent, report that fact before claiming the workflow. With approval, install the npm package or import the complete GitHub skill directory using the provider's skill-management flow.
4. Preserve the whole skill directory, including referenced `agents/`, `assets/`, `references/`, and `scripts/`; `SKILL.md` alone may be incomplete.
5. Start a fresh task or reload the provider's skill list, then confirm the skill appears before invoking it.

For Codex, each npm package includes its installer. Example:

```bash
npx --yes --package=fix-project-metadata-mismatches@latest \
  fix-project-metadata-mismatches --target codex --scope user
```

Replace `fix-project-metadata-mismatches` with the chosen canonical name. For another provider, open that package's npm README or GitHub directory and use its documented target and scope. When the provider cannot install portable skills, give it the GitHub directory URL and require it to read `SKILL.md` plus every resource that file directly references.

Browse the collection through [Skillfolio](https://skillfoliox.netlify.app). Installing a skill does not authorize publication, credentials, store submission, paid services, new permissions, or remote mutations.

## Chrome-extension routes

| Skill                             | Use in this starter           | When                                                                                                                     | Source and package                                                                                                                                                   |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `find-ui-inconsistencies`         | Yes                           | After popup, side-panel, onboarding, or options surfaces change                                                          | [GitHub](https://github.com/montasim/skills/tree/main/skills/find-ui-inconsistencies) · [npm](https://www.npmjs.com/package/find-ui-inconsistencies)                 |
| `fix-project-metadata-mismatches` | Yes                           | After initialization, rename, URL change, or version change; reconcile config, package, manifest, privacy copy, and docs | [GitHub](https://github.com/montasim/skills/tree/main/skills/fix-project-metadata-mismatches) · [npm](https://www.npmjs.com/package/fix-project-metadata-mismatches) |
| `write-complete-project-readme`   | Yes                           | After product identity, commands, permissions, and surfaces are stable                                                   | [GitHub](https://github.com/montasim/skills/tree/main/skills/write-complete-project-readme) · [npm](https://www.npmjs.com/package/write-complete-project-readme)     |
| `make-project-github-ready`       | Later                         | Before creating or professionalizing the remote GitHub repository                                                        | [GitHub](https://github.com/montasim/skills/tree/main/skills/make-project-github-ready) · [npm](https://www.npmjs.com/package/make-project-github-ready)             |
| `publish-verified-github-release` | Later, explicit authorization | When a verified ZIP and checksum are ready for a named GitHub release                                                    | [GitHub](https://github.com/montasim/skills/tree/main/skills/publish-verified-github-release) · [npm](https://www.npmjs.com/package/publish-verified-github-release) |
| `integrate-supportkori-widget`    | Optional, deliberate          | Only when support value outweighs the new network, CSP, and privacy surface                                              | [GitHub](https://github.com/montasim/skills/tree/main/skills/integrate-supportkori-widget) · [npm](https://www.npmjs.com/package/integrate-supportkori-widget)       |
| `verify-github-npm-release`       | Usually no                    | Only if shared modules are separately published to npm                                                                   | [GitHub](https://github.com/montasim/skills/tree/main/skills/verify-github-npm-release) · [npm](https://www.npmjs.com/package/verify-github-npm-release)             |
| `fix-social-link-previews`        | No direct use                 | Apply to the extension's separate landing page, not extension documents                                                  | [GitHub](https://github.com/montasim/skills/tree/main/skills/fix-social-link-previews) · [npm](https://www.npmjs.com/package/fix-social-link-previews)               |
| `make-app-netlify-ready`          | No direct use                 | Apply to the separate landing page                                                                                       | [GitHub](https://github.com/montasim/skills/tree/main/skills/make-app-netlify-ready) · [npm](https://www.npmjs.com/package/make-app-netlify-ready)                   |
| `deploy-prebuilt-app-to-netlify`  | No direct use                 | Apply to the separate landing page and only with authorization                                                           | [GitHub](https://github.com/montasim/skills/tree/main/skills/deploy-prebuilt-app-to-netlify) · [npm](https://www.npmjs.com/package/deploy-prebuilt-app-to-netlify)   |
| `release-agent-skill`             | No                            | It ships Agent Skills, not browser extensions                                                                            | [GitHub](https://github.com/montasim/skills/tree/main/skills/release-agent-skill) · [npm](https://www.npmjs.com/package/release-agent-skill)                         |
| `update-skillfolio-catalog`       | No                            | It updates the Skillfolio catalog, not this product                                                                      | [GitHub](https://github.com/montasim/skills/tree/main/skills/update-skillfolio-catalog) · [npm](https://www.npmjs.com/package/update-skillfolio-catalog)             |

Recommended local sequence: initialize → synchronize metadata → build one permission-minimal vertical slice → inspect UI consistency → verify manifest/build/ZIP/checksum → write the complete README → prepare GitHub. Store upload and release publication remain separate authorized steps.
