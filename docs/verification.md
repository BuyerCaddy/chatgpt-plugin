# Verification

Latest checkpoint: 0.2.8 is saved and installed after [fresh-chat acceptance](fresh-chat-acceptance-20261027.md). Existing authorization worked automatically in a new Codex chat. A continuation/error-disclosure defect was found, addressed in the instructions and retested. All 24 automated tests pass; first-time/expired login and ordinary cloud ChatGPT remain separate acceptance checks.

Latest checkpoint, 2026-10-27: version 0.2.7 is saved and installed; authenticated native Codex research is working. All 21 package/helper tests pass. See [Plugin Creator review](plugin-creator-review-20261027.md) for release read-back and remaining production acceptance, and [answer quality](answer-quality-20261027.md) for live retrieval evidence and conversation cases. The October 26 results below are historical and are not a statement of the current plugin version.

Checked October 26, 2026. Package 0.2.4 is saved in the existing private personal plugin. Gateway 0.4.1 is deployed as `buyercaddy-oauth-gateway-00023-vok`, with 100% traffic after candidate verification. This is not an approved public listing. See [authentication incident and release evidence](tool-auth-20261026.md).

## Current checks

- Package Node tests: 5 passed. All 18 research fixtures match their schemas; required fields, rejected unknown fields, paging boundaries, enum values, routing and contained Markdown links are checked.
- Python packaging tests: 8 passed. Includes OAuth configuration, private binding separation, credential exclusion, atomic repeat builds, icon/review metadata and absence of the removed credits skill.
- Gateway tests: 29 passed with mock upstream and in-memory storage, including public discovery, auth challenges, exact resource binding and continuation on a fresh private session after OAuth. Candidate/canonical discovery and native challenge checks passed against the real upstream. DCR, consent-page and cancellation checks passed for both resource URLs and all three callback families. A real MCP SDK connected and discovered 20 tools without a credential, then received the expected authentication challenge.
- Live upstream discovery advertises 20 tools. All 18 packaged research input schemas match the live tools; two account tools are intentionally outside the research reference. Discovery is not an authorized customer-data query.
- Portable plugin manifest passes the official Agent Plugins schema. MCP portable core passes its schema; the documented OpenAI auth extension is verified separately by package tests.
- Original 300 x 300 BuyerCaddy PNG remains in both icon fields. No replacement artwork or packaged credentials.
- Python and PowerShell build outputs are compared by entry names and uncompressed contents. ZIP metadata/compression may produce different archive hashes.

## Still unverified

- Actual ChatGPT sign-in with a personal API key, authorized research, pagination, refresh and disconnect. The eight review cases have not been run in ChatGPT.
- The saved personal plugin was verified by read-back as version 0.2.4, release `pluginrel_6adf70ec2c1c8191885fb929a7f7a3c2`, retaining 15 files, its identity, audience and listing. A later filesystem check confirmed the desktop cache updated to 0.2.4 with the new mixed-auth configuration. This was an intermediate result: 0.2.5 subsequently fixed the portable MCP parser rejection and exposed all 20 tools. See tool-auth-20261026.md and chat-sign-in-20261026.md for subsequent corrections.
- Main MCP annotation changes from earlier work remain unpublished. The live MCP lacks the complete annotation set needed for public review; this correction did not change or deploy that server.
- Public submission, publisher/domain verification, reviewer account, demo recording, country availability and policy readiness.

## Repeatability

Run `npm test`, `py -3 -m unittest discover -s tests -p 'test_*.py'`, and either documented package builder. In the sibling gateway project run `npm test`, `node scripts/check-tool-auth.mjs` and `node scripts/check-oauth-connection.mjs <canonical-or-candidate-base> /mcp/openai`. Live checks use no user credentials and cannot verify authorized data access.

The prior 0.2.1 source is retained in `.verification/before-research-only-0.2.1.zip`; local backup and audit files are excluded from distributable archives. The [previous review](plugin-creator-review.md) is marked historical. Public preparation remains separate from fixing this connection failure.

## Connection guidance update

Version 0.2.3 only added guidance. Version 0.2.4 selects the dedicated mixed-auth endpoint and preserves the original request through its native challenge. The existing personal plugin was updated, not duplicated. A displayed OAuth prompt and a real authorized lookup still require validation in the user's host.
