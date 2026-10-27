# First login and expired authorization — live host acceptance

The owner requested first-login and expired-authorization acceptance after the fresh-chat test established reuse of the existing grant. The working personal-plugin authorization was not cleared or inspected.

## Isolated live host check

A separate child-process Codex profile was created for the local package with its own file-based MCP OAuth storage. No credentials were copied from the working profile. The harness lives under excluded `.verification/`; it does not ship in the plugin or source archive. No inference request or persistent user chat was created inside the diagnostic host; the host used an ephemeral thread for a native MCP call.

The real gateway advertised 20 tools with authStatus notLoggedIn. The original bounded request was Vendors(nameOrDomain=salesforce.com, fuzzy=false, page=0, size=1). Before authorization, the call returned an MCP OAuth challenge rather than customer data.

The packaged helper initially failed at plugin/list with host error -32600 because an empty local profile cannot read the authenticated personal-plugin catalogue. The source fix checks MCP status first, using catalogue refresh only when the server is missing. Regression tests cover both local login without catalogue access and rediscovery of a missing remote plugin.

One further diagnostic attempt reported unsupported OAuth status and stopped without opening a login. A subsequent fresh isolated attempt reported notLoggedIn and successfully launched the host's DCR flow. This inconsistent host-status observation is retained as a limitation; it was not silently treated as authenticated.

The user completed the fresh host-generated browser sign-in. The host emitted the correlated authorization_completed notification with success=true. After a supported MCP configuration reload, the harness retried the exact original request and received one Salesforce vendor record, domain salesforce.com. This establishes real data access after first consent, not just URL generation.

## Live expired-grant recovery

Only the newly created isolated test client's grant was expired. A Firestore query projected clientId, exp, revoked and resource; encrypted keys and token values were never loaded. The script required exactly one matching active grant with the expected resource, then updated only exp using the document update-time precondition. The working profile's grant was not selected or changed.

The native MCP request then failed with host error -32603. Status reported notLoggedIn with zero tools: the host failed recovery before returning a tool-level challenge. The packaged helper still started a fresh DCR authorization flow. The user completed that second browser sign-in; the host reported success. After reloading MCP configuration, the identical Vendors request returned Salesforce again.

Connection guidance now covers temporarily missing tools after failed refresh: check host authorization status; a confirmed notLoggedIn starts sign-in. A generic host error alone is insufficient evidence of expired authorization. Ordinary HTTP 500 and missing company profiles must not trigger login.

## Expiry checks completed

The gateway's existing tests passed and two focused OpenAI-route cases were added in the gateway repository. All 31 gateway tests pass. These use a controlled clock and synthetic credentials in memory, not production keys or changes to live grants:

- After 901 seconds, the expired access token yields an invalid_token challenge without executing a business-data request. A valid refresh rotates tokens; the same serialized request then executes successfully, with no new consent grant.
- After 31 days, the expired grant rejects refresh with invalid_grant and cannot execute the request. Fresh consent issues a new grant; the identical serialized query succeeds. The old expired token remains unusable.

Connection guidance now distinguishes normal host refresh from required reauthorization and forbids forcing login on unrelated HTTP 500/profile failures.

## Validation and release

- Both first consent and expired-grant reauthorization resumed the exact original request through the real host and current source helper.
- The diagnostic harness invoked the helper after observing the failure. This proves the native host/helper/browser/retry path, not autonomous model selection in a new unauthenticated conversation or ordinary cloud ChatGPT.
- Ordinary access-token expiry with silent refresh is covered by controlled gateway tests; the live test above exercised full grant expiry requiring consent.
- Release 0.2.9 passes 18 Node and 8 Python plugin tests; all 31 gateway tests also pass with the explicit test-file glob.
- No Git commit, push or gateway deployment was performed. The original working grant was not deliberately expired; a separate working-profile sign-in was subsequently completed as described below.

## Saved release and working-profile follow-up

Plugin Creator saved private USER release `pluginrel_6ae099e40b48819193ba0a2c2891c5cb`, version 0.2.9, preserving the same plugin ID, audience, presentation and MCP endpoint. Six backend source files were read back and matched. The 17-entry Python and PowerShell plugin archives have identical names and uncompressed bytes. Uploaded ZIP SHA-256: `74b50066bfb350f17f3e50e4dac8ab9449e349b0dd5fe3d7a71136dc3b2b6aea`.

The source compatibility overlay was synchronized with backend-generated review/publication/keywords metadata before upload. The backend-generated legacy MCP file adds transport type and an empty headers object; its effective endpoint matches the minimal source legacy file. No credentials or diagnostic profiles are packaged.

Supported host installation confirmed enabled version 0.2.9. Its initial working-profile status unexpectedly reported notLoggedIn, and the actual chat's Vendors call requested connection. The cause was not established; this must not be attributed to the isolated grant mutation without evidence.

The installed 0.2.9 helper opened a fresh working-profile flow. The user completed it and the host reported success. The original native tool invocation in the already-running chat nevertheless still returned the connection challenge. A fresh native app-server connection in the same working profile, with a supported MCP reload and ephemeral thread, successfully executed the identical Vendors request and returned Salesforce. Its global status list was initially empty; successful data retrieval is the acceptance evidence.

Therefore authorization and the resumed business query work through a refreshed host connection, while immediate refresh of the already-running chat's tool connection remains unresolved. Do not ask the user to authorize repeatedly, claim this chat's stale tool call succeeded, or call seamless same-chat recovery production-ready. A new unauthenticated model conversation and ordinary cloud ChatGPT remain distinct acceptance targets.

Follow-up: version 0.2.10 adds and verifies automatic request continuation through the packaged helper, so a stale native chat connection no longer requires the user to repeat the request or enter settings. See [same-chat recovery acceptance](same-chat-recovery-20261027.md) for the actual path tested and its host boundaries.
