# Install BuyerCaddy

This package is a development/review candidate. It has not been approved or published in the public directory. The companion OAuth gateway supports ChatGPT. Installing this package still requires completing the browser connection with your own API key.

## Install the ZIP and authorize

Upload `buyercaddy-chatgpt-plugin.zip` through the host plugin import. Install BuyerCaddy and ask for a company or vendor lookup, or say **Connect BuyerCaddy**. The first research request requires OAuth. Prefer the host's native Connect action when displayed. In Codex with local execution, the research skill can instead launch the packaged sign-in helper and open the authorization page directly from the chat, without navigating settings. Enter your API key only on the BuyerCaddy consent page. In Codex, the helper automatically resumes the original bounded request after successful sign-in and returns its result to the same chat; no repeated prompt or completion message is needed. Installing the ZIP alone does not authorize data access. Hosts without native connection UI or local execution need their plugin connection settings.

If an older version is installed, use the host update flow where available. For an account-managed update, removing an obsolete skill also requires deleting its saved paths; overlaying a ZIP alone can retain the old skill.

## ChatGPT web development connection

1. Open [ChatGPT Plugins](https://chatgpt.com/plugins) in an account permitted to create custom connections.
2. Choose the plus button, then **Add custom MCP server**.
3. Enter **BuyerCaddy** and this server URL:

   `https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app/mcp/openai`

4. Select **OAuth or no authentication** (mixed). Only initialization and tool discovery are anonymous; every data tool requires OAuth. The package uses Dynamic Client Registration; do not enter your BuyerCaddy API key as an OAuth client secret.
5. Create the plugin and complete connection in the browser. Enter your own BuyerCaddy API key only on the gateway consent page and approve access.
6. Install the personal plugin, start a new Work chat, type `@`, and select BuyerCaddy. Ask for one vendor record for salesforce.com.

This tests the remote connection. It does not automatically install the bundled research skill or publish a directory listing. To test those skills, use the local package below or the host's supported private package workflow with its verified app binding. Do not create duplicate personal plugins when an existing BuyerCaddy connection is available.

## Local ChatGPT / Codex development package

Use the source folder or extract `buyercaddy-chatgpt-source.zip` into a permanent directory. It contains `.agents/plugins/marketplace.json` and `plugins/buyercaddy/`.

From that source directory, register the marketplace with a compatible Codex CLI:

```text
codex plugin marketplace add .
```

Restart the desktop host if required. Open Plugins, select **BuyerCaddy Local**, install **BuyerCaddy**, and connect using browser OAuth. Start a new chat. Host version and workspace policy determine which installation and login surfaces are available. No API-key environment variable is needed.

The single-plugin ZIP does not contain a marketplace. Extract it into a permanent plugin directory and use a host-supported plugin import, or use the source ZIP for the marketplace flow above. Do not place a repository/source ZIP into the public submission upload.

## Public directory installation, after approval

Once BuyerCaddy is published, users can find it in the shared ChatGPT/Codex Plugins directory, install it and select Connect. This repository does not yet provide a public listing link. Do not confuse a personal connection with public publication.

## Verify, reconnect and disconnect

An actual authorized vendor result verifies data access; a visible tool list alone does not. Next test a bounded company search, continuation and a company profile request. For expired/revoked access, reconnect through the host. Disable/uninstall the plugin to stop using it and use the host's disconnect action for the OAuth connection. Revoking the BuyerCaddy API key is a separate account action and can affect other integrations using that key.

For support, use the contact information on [BuyerCaddy](https://buyercaddy.com/). Include the host, package version and a sanitized error; never include keys, tokens or account exports.
