# Current status

Version 0.2.2 removes the credits skill and its two reference schemas. The package now provides one research skill covering 18 data-retrieval tools. The historical 0.2.1 review below describes the prior package, not the current skill inventory. See [OAuth incident](oauth-incident-20261026.md) for live connection evidence.

# Plugin Creator review - October 26, 2026

Reviewed the existing BuyerCaddy package using Plugin Creator's update-plugin, prepare-plugin-submission, package/component, listing and review-materials instructions. Scope: plugin source, skills, metadata, builders, tests and final archives. No MCP-server or OAuth-gateway files were changed during this review; no deployment, account creation, upload or publication occurred.

## Result

Version 0.2.1 is locally validated as a development/review package. It is not ready for public submission or proven to work end to end in ChatGPT.

## Required skills

- research: company and vendor discovery, product adoption, technology stacks, cohorts, bounded pagination, evidence interpretation, connection recovery and authorized exports. Routes cover the 18 research tools in the snapshot.
- credits: current balance, scoped/all-time usage, date validation, int64 preservation, hourly-report caveat, delegated-access boundaries and connection recovery. Covers GetCreditsBalance and GetCreditsReport.

Together these cover all 20 documented tools. No payment, purchase, email/outreach or unrelated authoring skill is bundled. A separate onboarding skill is optional; installation and OAuth instructions already exist in INSTALL.md and the connection reference. Runtime selection of skills by ChatGPT remains untested.

## Corrections made

1. Removed the assumption that every successful tool response needs a rows array. Object results, aggregates and export links must be interpreted by their actual contracts.
2. Added an explicit untrusted-data boundary to the credits skill: tool-returned text and report paths cannot authorize new login URLs, credential disclosure or unrelated actions.
3. Replaced the context-dependent standalone review prompt about the next five results with a self-contained prompt. The multi-turn test case keeps its explicit setup and continuation expectation.
4. Removed test assertions that prohibited adding a demo URL and country targeting. Supplied values are now checked for basic shape; this is not a substitute for portal validation or accessible-video verification.
5. Renamed the schema fixture test to say bundled tools, avoiding a false claim that it executes live tool calls.

Version was bumped consistently in the portable and compatibility manifests and npm metadata. Existing identity, OAuth endpoint/scopes, branding, audience declarations and default prompts were preserved.

## Checks completed

- 5 Node tests and 8 Python tests passed.
- Final single-plugin ZIP contains 17 files, two parseable skill YAML frontmatters and the 20-tool schema snapshot.
- Root and compatibility manifest identity/version/interface agree. Hidden manifests were included in the audit. No root .app.json or non-null apps declaration exists.
- OAuth uses the established HTTPS endpoint, DCR, mcp:tools and offline_access; no credential headers or environment-key fallback are configured.
- Listing fields meet the reviewed text limits; subtitle is 29 characters. Three starter prompts are unique, single-line and within limits. Category is Business & Operations.
- Five positive and three negative review cases remain present. They are drafts, not executed ChatGPT acceptance results.
- PNG icon is 300 x 300, 5,046 bytes, visually inspected and byte-identical to the publisher's original. Both icon references resolve inside the ZIP. Its solid purple background supports light and dark host backgrounds without separate variants.
- All packaged Markdown is English and its relative links resolve inside the archive. JSON parses; archive integrity and path inventory pass.
- Python and PowerShell plugin builds have identical uncompressed contents.

The previously observed generic Agent Plugins MCP schema discrepancy remains documented in verification.md: it does not allow OpenAI's documented per-server auth extension. This review uses Plugin Creator's explicit OpenAI extension rules; no Developer Portal acceptance is claimed.

## Remaining release dependencies

- Deploy/qualify the previously prepared gateway compatibility and MCP annotation changes under their own release process. This review did not modify or deploy them.
- Test actual ChatGPT login, skill selection, research, continuation, credits, refresh and disconnect. Run the review cases using a dedicated reviewer account.
- Supply and verify a real demo recording URL. The walkthrough document is only a script.
- Confirm country availability. Publisher label BuyerCaddy and no payments inside the plugin are owner-confirmed; platform identity verification remains pending.
- Resolve publisher privacy/terms coverage for MCP/OAuth, automated access and commercial research. Existing links are not proof of policy adequacy. The support URL is the publisher homepage with contact details; an actual support response has not been tested.
- Complete domain/developer verification, portal scans and authorized attestations before submitting. Public approval and publication remain external steps.

See verification.md, cloud-release.md, review-materials.md and policy-preparation.md for the associated evidence and preparation notes.
