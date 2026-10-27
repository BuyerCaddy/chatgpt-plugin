# Implemented authentication and release boundary

The package connects to the existing BuyerCaddy OAuth gateway. It contains no API keys, client secrets, bearer tokens, local bridge or server executable.

1. The host discovers the protected MCP resource and authorization server.
2. Dynamic Client Registration creates a public client (`token_endpoint_auth_method: none`).
3. Authorization Code with mandatory S256 PKCE opens the gateway's consent page.
4. The user enters their personal BuyerCaddy API key there. The gateway validates it, encrypts it at rest and binds it to that OAuth grant. This establishes possession of the credential, not a separately verified human identity.
5. The host receives an opaque 15-minute access token and, with `offline_access`, a rotating refresh token. Grants have a 30-day absolute lifetime.
6. The gateway resolves that grant, decrypts its key and forwards the personal key to the existing MCP. Caller-supplied keys, host bearer tokens and cookies are not forwarded upstream.

Scopes are the implemented `mcp:tools` and `offline_access`; there is no separate export scope. Delegated `onBehalfOfUser` must not be invented from a prompt. Upstream account permissions and accounting still apply.

## ChatGPT compatibility

The gateway advertises RFC 9207 issuer identification and includes `iss` on consent success and cancellation. Deployed gateway version 0.3.0 allows exactly `https://chatgpt.com/connector_platform_oauth_redirect`, in addition to the existing Claude callback and validated loopback callbacks. It does not allow wildcard ChatGPT paths. Confirm the exact URI shown in the host management page. A different URI requires a reviewed exact allowlist change, not a permissive redirect workaround.

The portable manifest selects DCR explicitly. CIMD is not advertised or implemented by this gateway. OAuth resource, state, browser/CSRF, PKCE, client and exact code-redirect binding remain enforced. Refresh replay revokes the grant; sessions remain grant-bound.

The deployed gateway also accepts the exact ChatGPT Origin and can serve a portal domain challenge when `OPENAI_DOMAIN_VERIFICATION_TOKEN` is configured. Do not configure a made-up token or replace another plugin's challenge.

Deployment and real host sign-in are separate from package construction. The local gateway tests use mock upstream data. Do not infer production readiness from them. See [verification](verification.md).

## Data-policy preparation

Prepare policy text from implemented behavior and confirmed operational facts. The gateway stores encrypted credentials, grants, hashed codes/tokens and encrypted session bindings; Firestore expiration/TTL and Cloud Run request logs have different retention behavior. Tool arguments and results travel through the MCP/API and the selected host. The service does not receive the entire conversation merely because it is connected, but tool arguments may contain user-provided context.

Before public review, confirm infrastructure log retention, deletion/support process, upstream data retention and the applicability of the published privacy policy and terms. Do not claim no logging, instant physical deletion, a specific human identity, or unverified compliance certification.

Sources: [OpenAI OAuth](https://developers.openai.com/plugins/build/auth), [submission](https://developers.openai.com/plugins/deploy/submission).

## Starting a request before Connect

Package 0.2.5 uses `https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app/mcp/openai` with only the portable transport type and URL. Codex Desktop 0.164.0-alpha.11.1 rejects server-level `extensions` in portable `mcp.json`, so the explicit mixed-auth extension from 0.2.4 has been removed. Protocol initialization, tool discovery and ping are public. Every tool descriptor has `securitySchemes: [{type: "oauth2", scopes: ["mcp:tools"]}]`, mirrored under `_meta` for compatibility. Tool calls without valid, correctly scoped access return a JSON-RPC error result with `_meta["mcp/www_authenticate"]`, including the protected-resource metadata URL, `error` and `error_description`. No customer-data request reaches upstream before authorization. Other anonymous methods fail closed. Native authorization UI still requires host acceptance testing; successful discovery alone does not prove it.

The original `/mcp` endpoint retains connection-level OAuth for existing Claude clients. Grants and token exchange/refresh are bound to the exact resource; a token for one endpoint cannot be used at the other. Discovery session IDs are separately encrypted and cannot be reused as private upstream sessions. Gateway 0.4.1 opens a fresh authenticated upstream session if the host retries the original query on its previous discovery transport after completing OAuth.

The skill asks the user to use the host's actual native Connect action, then continues the original query. If the host shows no action, the settings fallback remains. The model never assembles an authorization URL or collects a key. Gateway/SDK protocol checks are distinct from observing the native linking UI and receiving an authorized result in the real host.

Source: [OpenAI: triggering authentication UI](https://developers.openai.com/plugins/build/auth#triggering-authentication-ui). Verify the installed-but-disconnected scenario in the actual host; a package test does not demonstrate a displayed sign-in prompt.
