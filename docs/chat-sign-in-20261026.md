# Chat-initiated sign-in: 0.2.6

Update 2026-10-27: the user completed authorization in the Codex chat and native ProductsSearch/CompaniesSearch returned real data. Additional bounded retrieval checks are recorded in [answer quality](answer-quality-20261027.md). The statements below describe the earlier release checkpoint; ordinary cloud ChatGPT and automatic fresh-chat behavior remain unverified.

Package 0.2.5 fixed MCP discovery but did not bundle the diagnostic OAuth launcher. Version 0.2.6 adds `skills/research/scripts/connect.mjs` and makes the research skill invoke it on an explicit sign-in request or an authentication challenge when Codex has local execution but no native Connect action.

The script uses the verified local Codex executable and supported `plugin/list`, `plugin/installed`, `mcpServerStatus/list` and `mcpServer/oauth/login` methods. It creates no custom grants, reads no credentials, changes no settings, and never calls data tools. Codex generates PKCE, state and the loopback callback and stores the resulting grant. The script verifies the exact provider, resource, code flow and local callback before emitting the authorization URL. The agent opens this URL through the host browser tool and waits for the correlated completion notification in the tracked execution session.

Existing sign-in is reused. Explicit reconnect can handle expired OAuth. Cancellation and timeout do not count as successful authorization. The original bounded research request is retried once after success. A stale running-chat MCP connection is reported separately; no automatic refresh is claimed without an available host reload mechanism.

This is a Codex skill workflow with an explicitly executed helper, not a new server-side Connect tool or a universal cloud ChatGPT button. Hosts without local execution still need native OAuth support. No automatic hook or additional MCP server is installed.

Validation covers authenticated/missing/unsupported states, exact authorization URL validation, cancellation, callback failure and reconnect. The actual host also runs the installed helper for discovery and a fresh OAuth session. End-to-end customer data access still requires the user to complete sign-in.

Release evidence: 13 Node tests and 8 Python tests passed. Python and PowerShell packages contain 16 identical files. The same personal plugin was updated to release `pluginrel_6adf7c81c7c08191afa56c9c34e92973`; backend read-back confirms both the helper and its skill reference. Supported app-server installation updated the local cache to 0.2.6; all 20 BuyerCaddy tools remain discoverable. Executing `connect.mjs` from that installed cache returned `authorization_required` with a fresh host-generated OAuth URL; the host accepted the browser-open request. The previous diagnostic attempt expired without authorization and was not reused. Full user sign-in and the resumed research result remain unverified.
