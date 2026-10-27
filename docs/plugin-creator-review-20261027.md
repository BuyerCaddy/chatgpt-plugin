# Plugin Creator review — 0.2.7

Reviewed using the installed Plugin Creator update-plugin workflow, account-updates, plugin-packages and zip-requirements references. This is an existing private plugin update; public-submission approval is not implied.

## Findings resolved

- Ambiguous Salesforce Cloud wording could lead to a different product scope than the customer intended. Added explicit intent resolution and a single material clarification.
- Company rows could be presented as current product evidence without a product-specific date. Added source/date discipline, targeted verification and historical-evidence handling.
- Company names can disagree with domains or firmographics. Added an identity check and separation of unresolved records from confirmed outreach shortlists.
- Generic troubleshooting and a packaged review case contradicted the chat-initiated OAuth flow. Aligned both with native Connect, the supported local helper, and settings only as fallback.
- Root documentation incorrectly implied Node was never needed. Documented the optional helper's Node/Codex requirements separately from research and build tools.
- Release notes described only the previous sign-in change. Updated them for this release without changing listing, default prompts, icon, endpoint or audience.

## Verified

- 13 Node and 8 Python tests pass, including required fields, enums, page boundary 200/201, contained skill links, OAuth URL validation, cancellation and packaging exclusions.
- Python and PowerShell builds contain the same 17 entry names and identical uncompressed bytes. The exact uploaded ZIP SHA-256 is `471089366c75ffcacb0b0fc0ad2dfe13726fa7552d3a8cc182f8b77dc39a015b`.
- Compared candidate metadata against the backend's current release before updating: only version, release notes and the corrected negative auth case changed. Presentation and defaultPrompt values/type/order remained intact.
- Existing plugin `Plugin_18447cd8d8708191acaaca29a7e97551` updated to 0.2.7, release `pluginrel_6ae08d8636cc8191bba102b7bfa3d3d2`, scope USER and visibility PRIVATE unchanged.
- Backend read-back confirms all seven inspected changed/configuration source files match the prepared release. Inventory has 17 files, including the new quality reference.
- Supported host installation reports installed/enabled version 0.2.7, authStatus oAuth, toolsError null and all 20 live tools.
- Branding: visually inspected the original 300 × 300 PNG (white BuyerCaddy mark on purple). Source, previous package and installed 0.2.7 icon bytes have identical SHA-256 `B76E4CB05F0D46266C3F86FFEA866702F312320F9F4973E32E7081935CF855FE`. Both logo and composerIcon reference it; displayName and developerName remain BuyerCaddy. This verifies the asset and installed references, not a screenshot of the host's rendered plugin card. The repository README uses the same icon.
- Post-install CompanyProductsInUse for ltm-ulm.de still returns Salesforce Sales Cloud in use with last verification 2026-09-29. No new login was required.
- Seven pre-release live checks and 14 conversation acceptance cases are documented in [answer quality](answer-quality-20261027.md). These are different types of evidence; the 14 cases are not claimed as completed fresh-chat tests.

## Production acceptance still open

Branding follow-up: a later host-metadata check found that the personal-plugin list/detail responses discard all icon fields despite the correct installed file. See [branding acceptance](branding-host-20261027.md). The asset/hash check above did not establish UI readiness. This is a confirmed open presentation defect.

1. Run the conversation cases in a fresh chat with the installed skill. This tests automatic selection, clarification, formatting and continuation as experienced by the customer; code/schema tests cannot establish these behaviors.
2. If ordinary cloud ChatGPT is a launch target, complete its hosted MCP connection and authorized retrieval acceptance. The local Codex helper cannot register that connector. See [host acceptance](chatgpt-host-acceptance-20261026.md).
3. If public directory distribution is intended, complete the separate publisher/reviewer/demo/policy and portal checks. Updating the private plugin did not submit or publish a public listing.

The package and current authenticated Codex connection are verified within the checks above. Universal host readiness and production answer-quality acceptance are not yet established. Git source changes remain uncommitted pending the owner's approval of the commit message.
