# Public directory preparation

Use `dist/buyercaddy-chatgpt-plugin.zip` for the public upload. It contains portable root `plugin.json` and `mcp.json`, skills, assets, documentation and a compatibility manifest. There is no `.app.json` or non-null `apps` declaration. A registered app ID is not required to build this upload. Preserve any Portal-generated bindings when downloading a finalized release.

## Prepared

- Publisher label BuyerCaddy and no in-plugin payments: confirmed by the owner.
- Stable plugin identity, semantic version, English listing, three starter prompts and one research skill.
- Original BuyerCaddy square PNG, 300 x 300, used for the listing and composer.
- OAuth DCR, implemented scopes, public HTTPS endpoint; no packaged credentials.
- Five positive and three negative review cases in manifest metadata; all are drafts until run in ChatGPT.
- Product page, homepage contact information, privacy and terms URLs have been read, not merely checked for HTTP 200.

## Resolve before submission

1. Gateway 0.4.1 is deployed, including the dedicated OpenAI mixed-auth endpoint; credential-free discovery, native challenge and OAuth checks pass. Separately deploy the companion MCP tool-annotation changes through its normal release process, and test actual ChatGPT connect, research, pagination, refresh and disconnect. Run the complete review set with a dedicated test account. Reuse an existing development connection when available.
2. Confirm country availability. It is intentionally omitted from the manifest until the owner chooses countries or explicitly chooses all available countries.
3. Review public policies. The existing privacy page is generic and does not explicitly describe the MCP/OAuth credential flow. The terms dated March 14, 2023 include restrictions on commercial use and automated access that need clarification for this business research plugin. Existing URLs are not a declaration of legal readiness. See [policy preparation](policy-preparation.md).
4. Record the real demo described in [review materials](review-materials.md), host it with reviewer access, verify playback, then add `extensions.com.openai.review.demo_recording_url`. No invented URL is present.
5. Prepare a dedicated reviewer account with usable permissions, sample data and enough credits. Put credentials only in secure portal fields. Confirm publisher verification and select the intended organization/project.

## Portal, after preparation

Open [OpenAI Plugins](https://platform.openai.com/plugins), select Upload new or existing plugin, and choose the verified BuyerCaddy developer identity. Upload the ZIP. Connect the declared MCP, complete the exact domain challenge, authenticate and inspect tools/scans. The gateway can serve the exact challenge token at `/.well-known/openai-apps-challenge` when configured by its operator.

Check metadata, skill scans, tool annotations, saved review cases, support links and reviewer access. The remote server must advertise truthful boolean readOnlyHint, destructiveHint and openWorldHint values for each tool. A tested local update adds these flags to the 20 exposed research/credit tools, but live deployment is still pending; the ZIP cannot change server annotations.

Only after required checks and authorized attestations select Submit for review. After approval, Publish plugin is a separate action. No portal draft, review submission or publication has been performed by building this package.

## Private account-bound package

If an existing private installation requires an app mapping, the Python builder retains `--mode cloud --app-id <verified-id>`. This produces a separate private ZIP without direct MCP configuration. Confirm the ID, owner and access through the actual account. Do not upload this private archive to the public directory; its bindings belong to that installation.

Sources checked October 26, 2026: [package format](https://developers.openai.com/plugins/build/plugins), [submission](https://developers.openai.com/plugins/deploy/submission), [Claude migration](https://developers.openai.com/plugins/guides/submit-claude-plugin).
