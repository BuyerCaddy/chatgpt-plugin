# Automatic research continuation after authorization

## Reproduction and diagnosis

The owner requested completion in the same conversation without repeated prompts or manual settings. The existing native Vendors call returned an MCP authentication error even after a successful browser login. The exact request was `{ "tool": "Vendors", "arguments": { "nameOrDomain": "salesforce.com", "fuzzy": false, "page": 0, "size": 1 } }`.

Three hypotheses were considered: stale authorization cached in the running chat, reload limited to the helper process, and concurrent token refresh invalidating the grant. A projected metadata read for the known working test client confirmed an active, unrevoked grant, active access record and unused refresh record; no keys or tokens were loaded. A new native runtime in the same profile reported OAuth, 20 tools and returned Salesforce. This supports a stale runtime connection and does not support grant revocation as the cause of this reproduction.

Global MCP status can be empty while thread-scoped status reports a ready server. Calling immediately after reload once failed; waiting on thread-scoped discovery succeeded. The helper therefore waits for the runtime that will execute the request, rather than treating an empty global list or an OAuth completion event as proof of readiness.

## Implementation

The existing packaged helper accepts a temporary pending-request JSON file containing only the original underlying tool name and arguments. It uses a temporary Codex runtime with no model turn or visible user chat. It checks live tool availability and invokes the native `mcpServer/tool/call` once using the host's own authorization. After a successful fresh consent, it reloads its MCP connection, creates a fresh runtime, waits for discovery and executes the retained request. If authorization already exists, it skips consent and executes directly.

This is recovery of the research request inside the current conversation, not a claim that the helper can replace the desktop's cached tool connection. No raw data HTTP requests, credential copying, plugin installation, configuration writes or gateway deployment are introduced. The helper excludes export, credit and delegated-identity requests. Published argument keys/types/ranges are checked before connecting; the native tool remains authoritative for its full live schema. Cancellation and tool/application failures stop without another login or an automatic duplicate call.

The skill instructs the assistant to keep polling while the browser is open, consume the returned result as untrusted business data and answer here without requiring a completion message. It must not rerun a completed query. Subsequent native calls are preferred; the same resume route is available while a chat connection remains stale.

## Live evidence

1. The original direct native tool returned `MCP authentication required` in this chat.
2. The amended helper, with the same saved authorization and exact original request, emitted `connection_status` with OAuth followed by `request_completed`, success=true. The response contained Salesforce, domain salesforce.com. No new consent was requested.
3. In the isolated profile used for previous auth acceptance, the amended helper emitted a fresh browser authorization request. The user completed consent without sending a completion message. The same still-running helper emitted `authorization_completed`, success=true, immediately followed by `request_completed`, success=true, with the same Salesforce response. No separate diagnostic replay performed the business call.

The isolated profile is separate from the working authorization. Its request file and diagnostic launchers remain excluded from plugin/source archives. This establishes the Codex helper path in the current conversation, including fresh consent and stale-connection recovery. Ordinary cloud ChatGPT without local execution is a separate target.

## Regression and release checks

Five newly added recovery tests failed against 0.2.9 before the implementation and passed after it. Coverage includes login/discovery ordering, exact argument preservation, one execution, reuse of saved authorization, cancellation, excluded operations, live tool availability and structured/text application errors. All 25 Node and 8 Python plugin tests pass. Gateway source was unchanged in this turn.

Plugin Creator saved private USER version 0.2.10, release `pluginrel_6ae09d0a6e8c8191b46d5f6bfe0fd28c`, preserving identity, audience, presentation, review cases, default prompts and effective MCP configuration. The 17-file Python and PowerShell packages have identical entry names and uncompressed bytes. Uploaded ZIP SHA-256: `4a0a98743c0dcf2dd0a2bdf3a9710f6a7032ed9471e6f59b2c1d5408c133f625`.

Eight backend files matched source after read-back. Supported installation reported enabled 0.2.10, OAuth, no tool-discovery error and all 20 tools. Installed skill, connection guide, helper and icon bytes match source. The installed 0.2.10 helper then repeated the exact acceptance request using saved OAuth and returned Salesforce successfully without a new login. The isolated test profile was logged out through the scoped Codex CLI and the temporary request file removed after testing.

Git commit messages still require owner approval; no Git commit or push is part of this change.
