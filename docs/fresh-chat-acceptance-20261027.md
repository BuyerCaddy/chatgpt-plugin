# Fresh-chat acceptance — 0.2.7 to 0.2.8

Tested on 2026-10-27 in a newly created local Codex chat titled **Проверка BuyerCaddy в новом чате**, ID `01a17d36-e946-7be1-87b2-c55d5ef86bab`. The user explicitly requested this chat and the plugin tests. The chat started projectless with a normal customer request and the exact BuyerCaddy plugin mention; no copied company results or product IDs were supplied.

## Authentication and initial answer

Initial prompt: find three companies in Germany using Salesforce Sales Cloud, with company, website, size and last product verification in a table.

The chat loaded the installed 0.2.7 research skill and answer-quality reference. ProductsSearch resolved the exact Sales Cloud ID. CompaniesSearch used countryIn Germany, that product ID and size 3. The assistant retrieved pages 0 and 1 and individually verified the three displayed domains with CompanyProductsInUse.

The response showed Ltm GmbH, Mann + Hummel and GFT Technologies SE, with websites, returned employee ranges and product-specific verification dates. No login prompt, API key request, settings step or balance probe was needed. Successful data retrieval in the new chat demonstrates reuse of the existing authorization. It does not demonstrate a first-time or expired-token login.

## Findings in the continuation

The request for three more preserved the product, country and page size, used later pages and produced three distinct new companies: Rak Ceramics (Germany), nexum AG and AMADEUS FIRE AG. Each displayed product/date received an individual check.

However, CompanyProductsInUse for gethapply.com failed twice with HTTP 500 / Internal error. The customer-facing answer omitted that limitation. A subsequent audit without new data requests also exposed unused or unresolved rows and exclusions based on insufficiently established identity/geography concerns. This was a real answer-quality defect despite a plausible final table.

The follow-up asking whether the six companies use Sales Cloud right now and which are ready to buy passed: the assistant distinguished dated records from present usage, declined to infer buying intent from size or dates, and asked for the sales offer and target profile before ranking.

## 0.2.8 correction and retest

Updated the research skill and its pagination, answer-quality and troubleshooting references to preserve pending rows, track unresolved evidence checks, avoid repeating a failed check merely because a domain reappears, and disclose material omissions even when replacements fill the requested count. A foreign-looking name, phone prefix or domain suffix alone is not grounds to reject a country-filtered result.

Saved the existing private USER plugin as 0.2.8, release `pluginrel_6ae092952f98819196e00fb01437c2ca`. Listing, default prompts, endpoint, icon and audience were preserved. Backend read-back of the manifest and all four changed instruction files matches the source in UTF-8. The installed host reports 0.2.8, OAuth present, 20 tools and no tools error.

Retesting took place in the same test chat after explicitly asking it to load installed 0.2.8. This is an updated-instruction regression check, not another untouched fresh-chat test.

1. Asked for two more companies. The assistant first checked previously unresolved profiles, resolved Geeksoft's geography through returned profile data, kept other conflicting/missing profiles unresolved and used the same company-search filters/page size. It displayed Geeksoft Consulting and Infotip Service Gmbh with individual product checks.
2. The final answer disclosed the unavailable statista.org profile, other unresolved records and the earlier Jobtailor failure. It explicitly retained two unused rows for continuation. The prior Jobtailor check was not repeated.
3. Asked for one more company without special instructions. The assistant used the saved db.com row, made only one CompanyProductsInUse call, and returned Deutsche Bank with its product date. No new CompaniesSearch call occurred and there was no duplicate output.

## Validation and limits

- 16 Node tests and 8 Python tests pass. These cover package/helper behavior and branding detection, not all possible customer conversations.
- Python and PowerShell plugin ZIPs have identical uncompressed contents across 17 files. Uploaded ZIP SHA-256: `01dce02ee803b64cd17532878bf7dd3e1b90a6f0cec678d8922eb056ff9787e0`.
- Verified: installed skill selection in a fresh local Codex chat, existing OAuth reuse, exact-product/country retrieval, product-specific dates, distinct follow-up results, freshness/buying-intent boundaries, and improved pending-row/error disclosure after 0.2.8.
- Not run here: first-time login, expired/revoked credentials, ordinary cloud ChatGPT, every manual acceptance case, or a fresh chat starting directly on 0.2.8 without the earlier conversation. Existing helper unit tests cover simulated auth states but do not replace those host checks.
- The live upstream HTTP 500 and missing/conflicting profile data were handled, not repaired. The icon defect remains separately documented and was explicitly deferred by the owner.
- No Git commit or push was made; the owner still requires commit-message agreement.
