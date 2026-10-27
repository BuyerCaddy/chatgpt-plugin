# BuyerCaddy for ChatGPT and Codex

Research companies, software customers, vendors, technology stacks and peer cohorts. Connect through browser OAuth using your own BuyerCaddy access; no credentials are bundled.

## Install and connect

See [INSTALL.md](INSTALL.md) for local development installation, a ChatGPT web development connection, and the later public-directory installation flow. This archive is a development/review candidate, not an approved or published listing. The ChatGPT-compatible gateway is deployed; a real authorized ChatGPT lookup is still required to verify the complete host flow.

## Use

Choose BuyerCaddy in the host plugin picker (or type `@` and select it) and ask:

- Find five companies in Germany using Salesforce products.
- Show five recorded products used by microsoft.com.
- Show the next five products from the same search.
- Show the BuyerCaddy company profile for microsoft.com.

The [research skill](skills/research/SKILL.md) covers filtering, evidence, bounded pagination and exports. The bundled reference contains 18 research tool schemas from dated snapshots; the live server schema always takes precedence. A schema fixture is not proof of a live call.

## Access and limitations

The OpenAI connection permits discovery before sign-in and requires OAuth when a research tool is invoked. If Codex does not show a native Connect prompt, the bundled research skill runs its sign-in helper with the pending research request and opens the host-generated authorization URL from the chat. After consent the helper automatically executes that request through native MCP and returns the result to the same conversation, including when its old tool connection remains stale. This needs local execution, Node.js 22+ and Codex; other hosts use their native connection flow. The helper has no automatic startup hook and never reads the key. Only the completed data response establishes successful retrieval.

An existing BuyerCaddy account with API access is required. The plugin does not process purchases, payments, credit top-ups or outreach. Account permissions and service limits apply. Recorded adoption is evidence from BuyerCaddy, not proof of a paid contract, exhaustive coverage or current non-use.

Enter your API key only on the HTTPS BuyerCaddy connection page. Never put it in a chat, plugin file, URL, screenshot or support message. Local installation still makes requests to remote services.

## Support and data policies

- [Product and MCP overview](https://buyercaddy.com/buyercaddymcp/)
- [BuyerCaddy contact information](https://buyercaddy.com/) - info@buyercaddy.com
- [Privacy policy](https://buyercaddy.com/privacy-policy/)
- [Terms](https://buyercaddy.com/terms/)

These existing publisher policies need owner review for the plugin's actual data practices and commercial use before public submission. Source instructions reused from the Claude package retain the included [GPLv3 license](LICENSE). BuyerCaddy branding remains the publisher's trademark.
