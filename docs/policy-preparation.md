# Publisher policy review notes

These notes are technical preparation, not approved public terms or a replacement privacy policy.

## Verified existing pages

- Product: https://buyercaddy.com/buyercaddymcp/ describes the BuyerCaddy MCP service.
- Support: https://buyercaddy.com/ displays info@buyercaddy.com and the publisher's contact details. Actual support response has not been tested.
- Privacy: https://buyercaddy.com/privacy-policy/ is a general publisher policy; explicit MCP/OAuth coverage remains to be confirmed.
- Terms: https://buyercaddy.com/terms/ is dated March 14, 2023. Its commercial-use and automated-access restrictions need reconciliation with the offered MCP business-research use cases.

## Technical disclosure draft for the policy owner

The BuyerCaddy plugin connects ChatGPT or Codex to BuyerCaddy's remote MCP service. A user authorizes access in the browser. The connection service validates and encrypts the user's BuyerCaddy API credential, associates it with an OAuth grant, and issues opaque access and refresh tokens to the host. It uses that credential to perform the user's authorized BuyerCaddy requests. The plugin files do not contain user credentials.

The service processes tool arguments, requested account identifiers, company and technology queries, and results returned by BuyerCaddy. Grant, token and session records support access control, renewal and revocation. The implementation uses a 30-day grant lifetime, short-lived codes/access tokens, logical expiration and asynchronous storage TTL cleanup. Infrastructure request logs may contain connection metadata. Actual storage and log retention must be confirmed before publishing a retention statement.

The plugin has no checkout or payment operation. Existing BuyerCaddy service entitlements and credits can apply. Disconnecting the host connection and revoking the underlying API credential are distinct actions. Confirm the supported user deletion/contact procedure and upstream/host responsibilities before publishing this explanation.

## Owner decisions still needed

Confirm the policy's scope for MCP/OAuth, commercial and automated use permissions, controller/contact details, upstream and infrastructure retention, deletion handling, applicable subprocessors and country availability. Do not assert a certification, blanket no-storage/no-logging promise, or guaranteed immediate deletion without evidence. Publish approved changes on the publisher-controlled site, then recheck the manifest URLs.
