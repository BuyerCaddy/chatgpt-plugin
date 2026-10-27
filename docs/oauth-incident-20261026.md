# ChatGPT connection failure, October 26, 2026

## Reproduced cause

The canonical OAuth gateway reported version 0.2.0. POST /register with the documented ChatGPT callback returned HTTP 400 and `invalid_redirect_uri`. The installed package could not complete DCR through that endpoint. Supporting code existed locally but had not been deployed.

The owner confirmed that login means entering a personal BuyerCaddy API key on the OAuth consent page. No account-password integration is required. Installing a skill or ZIP alone does not authorize the MCP connection.

## Released fix

Gateway 0.3.0, revision `buyercaddy-oauth-gateway-00019-wet`, now serves 100% of traffic. Previous revision: `buyercaddy-oauth-gateway-00017-yil`. Service: buyercaddy-oauth-gateway, project key-component-435602-d5, region us-central1. The canonical URL, encryption-secret configuration, database, and upstream MCP endpoint were preserved.

The change permits the exact ChatGPT callback and Origin while retaining strict Claude and native callback checks. No wildcard redirects were enabled. Candidate deployment used zero production traffic; promotion followed the checks below. Main MCP server code was not changed or deployed in this correction.

## Evidence and limits

- Gateway tests: 21 passed against mock upstream and in-memory storage, including complete ChatGPT token, refresh and revoke flows.
- Candidate and canonical service: health 0.3.0; ChatGPT, Claude and native DCR 201, consent page 200, cancellation 303. Exact callback, state and issuer verified; unauthorized MCP access returns 401; malicious Origin returns 403; lookalike callback rejected.
- Reproduce credential-free checks with `node scripts/check-oauth-connection.mjs` in the sibling gateway project. Use its candidate URL argument before promotion. No API key or grant is created by the cancellation check; flow records and client registrations are created with their existing expiry policies.
- No real user API key was used. Successful token issuance and customer-data retrieval through ChatGPT remain unverified. Local mocked tests and real cancellation checks do not prove those steps.
- The old private plugin ID returned NOT_FOUND; the owner confirmed deleting that plugin. No replacement account plugin was created automatically.

## Package correction

Version 0.2.2 provides one research skill and 18 documented research tool contracts. The unrelated credits skill and its balance/usage prompts were removed. The shared live MCP still advertises 20 tools, including two account tools: removing a skill does not remove server capabilities. The research workflow does not run credit checks as a prerequisite.

The original icon and credential-free OAuth configuration remain. English installation instructions now distinguish uploading the ZIP from connecting OAuth. Reload the new package, select Connect, enter the personal API key on the HTTPS consent page and test one vendor result before a larger search.

## Rollback

If necessary, route this gateway to revision buyercaddy-oauth-gateway-00017-yil using the existing Cloud Run traffic command. That restores the previous callback behavior and also restores the ChatGPT DCR failure. Keep grants and encryption secrets intact.
