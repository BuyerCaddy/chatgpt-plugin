# ChatGPT acceptance failure after 0.2.6

The user tested `Find companies using Salesforce products` in the ordinary ChatGPT conversation `Find Salesforce users` (6adf8690-8458-83ed-9342-d7ed5f6c8ffa). The host thread reader confirms kind `chatgpt`, no local cwd, and the BuyerCaddy mention. The user supplied the response: no BuyerCaddy tools available; directory search also found none. Reading the thread through the supported reader returns a content reference for the assistant answer, not its tool trace. Do not claim an independently replayed cloud-model test.

Current local Codex evidence is different: all 20 BuyerCaddy tools are exposed in the diagnostic conversation. A native Vendors call for salesforce.com, page 0, size 1 returned the connection-required error rather than data. The packaged OAuth helper's prior attempt ended with success=false; no user grant or authorized lookup has been established.

The direct plugin metadata reports version 0.2.6, `mcpServers: [buyercaddy]`, `apps: []`, and `appTemplates: []`. A refreshed installed hosted-connector snapshot contains 12 connectors and no BuyerCaddy. Thus the installed package's local MCP and the hosted ChatGPT connector are distinct. The Codex helper cannot supply missing cloud tools or register a hosted connector. Its successful OAuth launch is not acceptance evidence for ordinary ChatGPT.

The required next acceptance step is a verified ChatGPT-hosted MCP connection for the existing BuyerCaddy integration, with real discovered tool bindings. Use a supported account connection workflow; do not invent an app ID or silently replace the plugin identity. Then test native connection UI and the same Salesforce query in ChatGPT. Available plugin source editor tools manage package files and do not expose custom hosted-MCP connection creation. Browser/UI interaction, if needed, must follow its own supported boundaries.

Official connection workflow: https://developers.openai.com/plugins/deploy/connect-chatgpt#add-the-mcp-server
