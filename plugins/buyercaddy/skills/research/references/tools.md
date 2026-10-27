# BuyerCaddy research tools

Discovered: 2026-10-01T13:38:55.941Z. Snapshot source: https://mcp.salescaddy.ai/mcp.

Plugin connection: https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app/mcp.

This snapshot includes the 18 research tools used by this plugin. The shared MCP may advertise additional account tools; those are not part of this research workflow. Current tools and schemas override this snapshot. Read the relevant section; exact schemas and descriptions are in [tools.json](tools.json). Output fields must be interpreted from the actual result and the server documentation.

## CompanyCohort

Get cohort products companies for a given company domain and cohort type

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| cohort | no | {"type": "string", "enum": ["Default", "Defined", "Aspirational"], "default": "Default"} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CompanyBenchmarkDetails

Get usage of products by custom cohort (benchmark details).

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| cohortCompanyDomain | yes | {"type": "array", "items": {"type": "string", "minLength": 1}, "minItems": 1, "maxItems": 10} |
| productId | no | {"type": "string"} |
| vendorDomain | no | {"type": "string"} |
| categoryId | no | {"type": "string"} |

Exact input schema: [tools.json](tools.json).

## CompanyFeed

Fetch company feed entries by domain.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| category | no | {"type": "array", "items": {"type": "string", "enum": ["NEWS", "PRESS", "FUNDING", "ACQUISITION", "PEOPLE", "BLOG", "VIDEOS"]}} |
| paginationId | no | {"type": "string", "minLength": 1} |

Exact input schema: [tools.json](tools.json).

## CompanyFirmographics

Fetch firmographics for a company by domain.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |

Exact input schema: [tools.json](tools.json).

## CompanyCompetitors

Find competitors for a company by domain

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CompanyProductRelated

Get related products for a company's product within a cohort.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| productId | yes | {"type": "string", "minLength": 1} |
| groupName | yes | {"type": "string", "enum": ["Default", "Defined", "Aspirational"]} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CompaniesSearch

Search live BuyerCaddy companies with optional name, geography, firmographic, product, vendor, and category filters. Use exact employeeRangeIn and revenueRangeIn enum values. countryIn is the country filter. Arrays use OR unless the corresponding ...And flag is true.

| Parameter | Required | Type / constraints |
|---|---|---|
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |
| companyNameContains | no | {"type": "string", "minLength": 1} |
| postalCodeIn | no | {"type": "array", "items": {"type": "string"}} |
| stateIn | no | {"type": "array", "items": {"type": "string"}} |
| cityIn | no | {"type": "array", "items": {"type": "string"}} |
| countryIn | no | {"type": "array", "items": {"type": "string"}} |
| companyDomainIn | no | {"type": "array", "items": {"type": "string"}} |
| industryIn | no | {"type": "array", "items": {"type": "string"}} |
| vendorDomainIn | no | {"type": "array", "items": {"type": "string"}} |
| vendorDomainNotIn | no | {"type": "array", "items": {"type": "string"}} |
| productIdIn | no | {"type": "array", "items": {"type": "string"}} |
| productIdNotIn | no | {"type": "array", "items": {"type": "string"}} |
| mainCategoryIdIn | no | {"type": "array", "items": {"type": "string"}} |
| mainCategoryIdNotIn | no | {"type": "array", "items": {"type": "string"}} |
| intensityBucketIn | no | {"type": "array", "items": {"type": "string"}} |
| dateLastVerifiedBucketIn | no | {"type": "array", "items": {"type": "string"}} |
| employeeRangeIn | no | {"type": "array", "items": {"type": "string", "enum": ["Less than 10", "10 - 49", "50 - 199", "200 - 499", "500 - 999", "1,000 - 4,999", "5,000 - 9,999", "Above 10,000"]}} |
| revenueRangeIn | no | {"type": "array", "items": {"type": "string", "enum": ["Less than 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M - 50M", "50M - 100M", "100M - 500M", "500M - 1B", "More than 1B"]}} |
| vendorDomainInAnd | no | {"type": "boolean", "default": false} |
| vendorDomainNotInAnd | no | {"type": "boolean", "default": false} |
| productIdInAnd | no | {"type": "boolean", "default": false} |
| productIdNotInAnd | no | {"type": "boolean", "default": false} |
| mainCategoryIdInAnd | no | {"type": "boolean", "default": false} |
| mainCategoryIdNotInAnd | no | {"type": "boolean", "default": false} |

Exact input schema: [tools.json](tools.json).

## ProductsSearch

Search products whith parameters.

| Parameter | Required | Type / constraints |
|---|---|---|
| search | yes | {"type": "string"} |
| categoryId | no | {"type": "string"} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CompanyCohortMetricUsage

Get usage metrics within a cohort products for a company. Requires either a productId or a vendorDomain.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| cohort | yes | {"type": "string", "enum": ["Default", "Defined", "Aspirational"]} |
| productId | no | {"type": "string", "minLength": 1} |
| vendorDomain | no | {"type": "string", "minLength": 1} |

Exact input schema: [tools.json](tools.json).

## VendorProducts

Find all products associated with a single vendor (by domain).

| Parameter | Required | Type / constraints |
|---|---|---|
| nameOrDomain | yes | {"type": "string", "minLength": 1} |
| productName | no | {"type": "string", "minLength": 1} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## Vendors

Search vendor by company name or domain.

| Parameter | Required | Type / constraints |
|---|---|---|
| nameOrDomain | no | {"type": "string"} |
| fuzzy | no | {"type": "boolean", "default": false} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CompanyProductsAsJson

Fetches all products for a single company as a JSON object or returns a pre-signed URL for download.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| onBehalfOfUser | yes | {"type": "string", "format": "email"} |

Exact input schema: [tools.json](tools.json).

## FindCustomersOfProducts

Find customers of products

| Parameter | Required | Type / constraints |
|---|---|---|
| prompt | yes | {"type": "string"} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## FindTechstacksForCompany

Find tech stack / products used by a company (based on natural-language query).

| Parameter | Required | Type / constraints |
|---|---|---|
| prompt | yes | {"type": "string"} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |

Exact input schema: [tools.json](tools.json).

## CategoriesSearch

Search product categories and return those whose name matches any of the provided queries (substring, case-insensitive).

| Parameter | Required | Type / constraints |
|---|---|---|
| queries | yes | {"type": "array", "items": {"type": "string", "minLength": 1}} |

Exact input schema: [tools.json](tools.json).

## SearchIndustries

Fetch all industries and return those whose name matches any of the provided queries (substring, case-insensitive).

| Parameter | Required | Type / constraints |
|---|---|---|
| queries | yes | {"type": "array", "items": {"type": "string", "minLength": 1}} |

Exact input schema: [tools.json](tools.json).

## CompanyProducts

Gets a list of products used by the company, there is a division into pages, by default page=0 size=20.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string", "minLength": 1} |
| onBehalfOfUser | no | {"type": "string", "format": "email"} |
| page | no | {"type": "integer", "minimum": 0, "default": 0} |
| size | no | {"type": "integer", "minimum": 1, "maximum": 200, "default": 20} |
| mainCategory | no | {"type": "array", "items": {"type": "string"}} |
| mainCategoryId | no | {"type": "array", "items": {"type": "string"}} |

Exact input schema: [tools.json](tools.json).

## CompanyProductsInUse

Check whether a company uses specific products or products from specific categories.

| Parameter | Required | Type / constraints |
|---|---|---|
| companyDomain | yes | {"type": "string"} |
| productNames | no | {"type": "array", "items": {"type": "string", "minLength": 1}} |
| productIds | no | {"type": "array", "items": {"type": "string", "minLength": 1}} |
| categoryNames | no | {"type": "array", "items": {"type": "string", "minLength": 1}} |
| categoryIds | no | {"type": "array", "items": {"type": "string", "minLength": 1}} |

Exact input schema: [tools.json](tools.json).
