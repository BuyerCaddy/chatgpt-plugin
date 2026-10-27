# Answer quality: 0.2.7

## Scope

This update makes customer intent, evidence and presentation explicit in the research skill. It preserves the existing private plugin identity, OAuth endpoint and tool contracts. The server page maximum is 200 records, not a limit on the total searchable population. No server deployment is part of this update.

The repository initially contained only LICENSE at commit 0621d9a. The existing 0.2.6 source, builders and tests were imported, then the quality changes applied here. Commits require the owner's approval of their messages; none was made during preparation.

## Live checks in the authenticated Codex chat

Executed 2026-10-27 with native BuyerCaddy tools. Small samples only; no credential inspection, credit lookup or full export. The exact catalog ID used for Salesforce Sales Cloud was `3551cb74-ee3a-4f0e-a12b-61dec3a4cc0c`, resolved in the preceding successful ProductsSearch.

| Check | Observed result | Consequence for answers |
|---|---|---|
| Verify earlier broad Salesforce result: innotrac.com against four returned cloud product IDs | Commerce Cloud Suite true, last verified 2021-10-06; both Sales entries and the Service entry false | Cannot call this a current Sales Cloud customer. Show historical product evidence and avoid broadening exact-product requests. |
| Exact Sales Cloud + Germany, page 0, size 3 | vaillant.fr, dpdhl.com, ltm-ulm.de; all returned country Germany; totalElements 190, totalPages 64 | Attribute country and total to BuyerCaddy. A .fr domain alone does not invalidate returned country. Three retrieved rows are not all 190. |
| Same query, page 1, size 3 | mann-hummel.com, gft.com, payworks.com; same total; no overlap with page 0 | Six unique domains across the two retrieved pages; completeness remains partial. Preserve page size and filters. |
| ltm-ulm.de product-level verification | Sales Cloud true; last verified 2026-09-29 | Supports a product-specific verification date for this row. |
| Exact Sales Cloud + Germany + employee buckets 1,000–4,999 / 5,000–9,999 / Above 10,000; size 2 | dpdhl.com and mann-hummel.com, both Above 10,000; totalElements 60 | Geography, product and supported size filters combine successfully in this sample. This is a sample, not a ranked list of the best prospects. |
| dpdhl.com identity follow-up | Search name Exel; CompanyFirmographics name Deutsche Post AG, short_name DHL Group, website group.dhl.com | The sources conflict on entity identity. Do not silently rename or treat group/subsidiary adoption as interchangeable. Mark for identity confirmation. |
| mann-hummel.com product-level verification | Sales Cloud true; last verified 2026-09-28 | Supports a second specific product/date pair. |

These seven live calls validate retrieval and reveal evidence risks. They do not measure model behavior across fresh chats. Only ltm-ulm.de and mann-hummel.com received separate exact-product confirmation in this check; the six-row search should not be described as individually reverified.

## Example of the intended customer answer

This is a two-row illustration composed from the real observations above, not a new full search or ranked shortlist:

> В BuyerCaddy найдены следующие компании из Германии с записью об использовании Salesforce Sales Cloud:
>
> | Компания | Домен | Сотрудники по BuyerCaddy | Последняя проверка продукта |
> |---|---|---|---|
> | Ltm GmbH | ltm-ulm.de | 10–49 | 29.09.2026 |
> | Mann + Hummel | mann-hummel.com | Более 10 000 | 28.09.2026 |
>
> Это два примера, не полный список. Продукт и даты проверены через BuyerCaddy CompanyProductsInUse; страна и размер — CompaniesSearch. Даты отражают записи в базе и не гарантируют использование сегодня.

For an actual customer requesting 10 companies, retrieve and support 10 or explain why fewer are available. Do not reuse this example as factual evidence for future requests.

## Conversation acceptance cases

These are repeatable manual acceptance cases, not automated model pass claims. Run in a fresh chat with the installed skill and inspect both calls and the customer-visible answer. Use fixtures or bounded retrieval; a 450-row pagination case can be tested with fixtures without consuming 450 live records.

| Prompt / situation | Required behavior | Reject |
|---|---|---|
| Find companies using Salesforce Cloud | One short question about exact cloud vs portfolio unless prior context resolves it | Silently picking Sales/Service/Commerce |
| Find 10 German companies using Salesforce Sales Cloud | Resolve exact product, country filter, up to 10 supported unique companies; concise table | Unnecessary discovery questionnaire, vendor-wide substitution |
| Find companies using Salesforce products | Vendor portfolio scope, stated briefly, bounded sample | Asking which cloud despite explicit broad scope |
| Best Salesforce prospects | Ask for ranking criteria if no target profile exists | Calling default order "best" |
| Companies with 100–500 employees | Explain overlapping buckets or obtain exact counts | Treating 50–199 and 500–999 as exact 100–500 |
| Does innotrac.com currently use Sales Cloud? with the recorded fixture above | No confirmed Sales Cloud evidence; separate historical Commerce result only if useful | Answering yes because some Salesforce product is present |
| Show current users; last evidence is from 2021 | Historical evidence, current status unconfirmed | "Currently uses", "verified today" |
| Conflicting company name/domain | Targeted identity lookup; flag unresolved group/entity mismatch | Silent name replacement |
| Product verification false / exclusion filter | No matching evidence recorded | Proven non-use |
| Show 450 companies | Calls of at most 200, stable size and filters; trim final selection, explain partial failure | size=450; changing page size midstream; treating 200 as global cap |
| Continue the previous list | Next page with same filters and size; deduplicate; preserve counts | Restarting page 0 or changing scope |
| Zero results / failed query | Distinguish real empty result from error; keep hard filters | Invented rows or silent broadening |
| Estimate market share from a sample | Explain coverage and missing denominator | Calling database counts or a convenience sample total market size |
| Russian request, English product names | Russian prose, original product names, concise useful columns | Raw JSON, tool IDs in the main table, unsolicited export |

## Acceptance boundary

Release and package verification are recorded in [Plugin Creator review](plugin-creator-review-20261027.md). Version 0.2.7 was saved and installed; a post-install product check also succeeded. The seven checks above precede release, and that extra check verifies the connection after installation.

Local package tests cover schemas, links, sign-in helper behavior and packaging. Instruction review and the live observations above support this update; they do not certify that every model/host will obey the workflow. Fresh-chat automatic selection and ordinary cloud ChatGPT hosted-connector authorization remain separate acceptance tasks. The current chat's successful data requests do not resolve the previously documented cloud connector gap.
