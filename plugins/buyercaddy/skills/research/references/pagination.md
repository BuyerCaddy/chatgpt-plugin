# Pagination and continuation

Read the actual tool schema before assigning navigation parameters:

| Contract | Tools | Rules |
|---|---|---|
| Zero-based page + size | CompaniesSearch, ProductsSearch, Vendors, VendorProducts, CompanyProducts, CompanyCohort, CompanyProductRelated, FindCustomersOfProducts, FindTechstacksForCompany | Integer page >= 0; size 1–200, default 20 in the snapshot |
| Size only | CompanyCompetitors | Size 1–200; no page parameter |
| Cursor | CompanyFeed | Pass returned paginationId; do not invent page or size |
| Unpaged | CompanyFirmographics, CompanyProductsInUse, CompanyBenchmarkDetails, CompanyCohortMetricUsage, CategoriesSearch, SearchIndustries | Single/batch/aggregate result; no page loop |
| Export | CompanyProductsAsJson | Separate authorized full-inventory operation; not an automatic pagination shortcut |

## Bounded retrieval

1. Establish the unit: companies, products, installation relationships, feed entries or aggregates. A data array length/resultsCount is the current batch count unless the service explicitly defines a global total.
2. Honor explicit page/size. The server caps a page at 200 records. If a requested size exceeds that maximum, explain the per-call cap and split the requested total into valid calls. For N results start at page 0 with size min(N, 200); keep that size on later pages and trim only the final displayed selection. Do not call the first N "top" or "best" without an agreed ranking and supporting data. Default to one page of 20 when quantity is unspecified, label it a sample and offer continuation.
3. Preserve tool, canonical filters, sort and page size. The next offset is page * size; changing size midstream can skip or repeat records. A changed query begins a new selection. Keep a compact internal continuation state in the conversation: last fetched page/cursor, shown domains, pending unseen rows, unresolved/excluded rows with reasons, and failed enrichment attempts. Reaching N displayed rows does not mean every fetched row was consumed. On "more", process pending rows before fetching another page; never silently discard the unused remainder of the previous page. Reuse earlier successful evidence.
4. Follow an explicit next cursor or authoritative totalPages/hasNext when returned. A short or empty displayed page after filtering does not prove the source is exhausted. With authoritative totalPages, follow that bound even if an intermediate source page is short.
5. Without authoritative metadata, a full page leaves completeness unknown. A short page is an exhaustion hint only when supported by the service's contract. For AI-generated queries, label totals/completeness unknown rather than manufacturing a total. Avoid unbounded probes for proof of exhaustion.
6. Detect repeated source pages/cursors before appending. Deduplicate companies by canonical domain, products by returned ID, and installations by company + product ID (or returned product/vendor identity if no ID). Keep source row count separate from unique result count. Repeated/no-progress pages stop retrieval as incomplete.
7. Stop at requested N unique results, authoritative exhaustion, cancellation, an error or the safety budget. Default multi-page budget: at most 10 retrieval calls or 2,000 source rows per user turn, including discovery/enrichment toward the same result. State the limiting reason and continuation point; explicit larger tasks should agree a bounded export/retrieval plan rather than run indefinitely.

Do not restart a successful search just to reformat it. Reuse the results and enrich only necessary fields. If a page fails, preserve previous pages and mark partial. Honor Retry-After for transient failures; avoid automatic retries of AI-backed calls with uncertain cost/outcome.

An individual enrichment failure does not invalidate successful rows. Keep that candidate unresolved, disclose the omission in one short note, and use other pending candidates within the budget when the customer requested a shortlist. Do not call the result an exhaustive or fully sequential list. A failed retrieval page, authentication failure, quota response or no-progress page stops paging rather than silently jumping over the gap. Keep unresolved candidates for an explicit later retry; do not repeatedly retry the same failed enrichment merely because that domain appears again on another page.

## AI search stability

FindCustomersOfProducts and FindTechstacksForCompany accept page/size, but a natural-language query may regenerate SQL. Identical prompt text does not prove a stable result snapshot. Prefer structured filters and resolved IDs when possible. Preserve the exact prompt across AI pages, inspect scope/order and duplicates, and disclose that snapshot completeness is unverified unless the backend guarantees it. Never expose internal SQL/chatHistory by default.

## Completion wording

Use claims such as: “Retrieved 40 records across 2 pages; 31 unique companies. More results may exist.” Use “all” only with confirmed exhaustion and no failed, dropped or truncated pages. An export link has its own access/expiry restrictions; return the authorized link without changing its host or sharing it elsewhere.
