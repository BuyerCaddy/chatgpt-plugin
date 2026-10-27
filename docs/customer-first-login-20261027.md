# Ordinary customer prompt in new chats — authorization precondition unresolved

The owner requested an ordinary customer request in a new chat, with automatic sign-in and a useful answer after consent. Both new chats received only the same customer prompt, including the BuyerCaddy plugin mention: find five German companies using Salesforce Sales Cloud, with name, website, industry, available product verification date and a short explanation of inclusion. No implementation or authentication instructions were injected into the prompt.

## Run 1: saved-authorization recovery

Chat `01a17d68-9c1a-7541-9065-8f23d63cb31e` loaded installed 0.2.10. Its first ProductsSearch failed authentication. The model independently read the connection guide and launched the packaged helper with the original ProductsSearch arguments. The helper found existing OAuth and executed successfully without a new consent screen. The model correctly corrected its earlier sign-in announcement and continued the search.

The answer contained five unique company websites, industries explicitly attributed to BuyerCaddy, product-specific verification dates and a sample/completeness note. ProductsSearch returned Agentforce Sales (formerly Salesforce Sales Cloud), product ID `16e299ae-0256-44e3-8989-7647815550d4`. CompaniesSearch preserved Germany and this ID. Individual CompanyProductsInUse results confirmed productInUse=true for iubh.de, stroeer.com, fresenius.com, biotronik.com and koenig-neurath.de, all with dateLastVerified=2026-10-03. The temporary request file was removed.

This run verifies autonomous selection of the installed recovery helper and completion of a multi-call customer request in the same chat. It does not verify first consent because saved authorization was reused.

## Run 2: native connection remained authorized

Chat `01a17d6b-6e34-7270-bde2-acc19e56b576` completed through native BuyerCaddy tools without any sign-in. It resolved Salesforce Sales Cloud as returned by that connection, product ID `3551cb74-ee3a-4f0e-a12b-61dec3a4cc0c`, preserved Germany and that product, retrieved two pages of five companies and checked product usage individually.

The final table contained ltm-ulm.de, mann-hummel.com, gft.com, payworks.com and robustastudio.com. It disclosed the Vaillant verification failure and excluded inconsistent company profiles. It labelled the result as five selected companies out of ten retrieved, not a complete market list. The two connections returned different catalog entries; this is recorded as observed scope, not assumed to be the same underlying dataset or authorization.

## Why the sign-in test remains open

The plain Codex logout command did not find plugin-supplied server configuration. A process-only explicit URL override made the supported logout command report removal of BuyerCaddy OAuth credentials, but run 1 still found a usable saved authorization. Next, the known grant created during the earlier working-profile test was explicitly expired using a metadata-only projection, exactly-one-grant checks and an update-time precondition. Only its exp field changed; keys and token values were never read. Run 2 nevertheless retained authorized native tool access.

Consequently neither new chat was a verified unauthenticated application state. No first-consent pass is claimed. The native app connection and local helper must not be assumed to share one effective credential/runtime state. Further broad grant revocation or credential-store inspection was not attempted.

The Computer Use inventory identified the current window as ChatGPT. Its loaded guidance prohibits automating that desktop UI. The owner was asked to disconnect BuyerCaddy authorization in the application while keeping the plugin installed, so the test can be repeated with the required precondition. The owner then explicitly paused this test. First-consent acceptance in a new unauthenticated application chat remains open; do not resume it without a new request. No further plugin release, Git commit or push was made during these tests.
