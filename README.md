# BuyerCaddy plugin for ChatGPT and Codex

<img src="plugins/buyercaddy/assets/buyercaddy-icon.png" alt="BuyerCaddy" width="80" height="80">

The maintained OpenAI package lives in `plugins/buyercaddy/`. It connects to the existing BuyerCaddy OAuth gateway and bundles one data-retrieval research skill, a firm-branded square icon, and English documentation. It preserves the `buyercaddy` plugin identity.

Version 0.2.7 adds customer-intent handling and evidence-aware answer presentation. See [quality observations and conversation acceptance cases](docs/answer-quality-20261027.md) for the live checks, examples and unverified host behavior.

Version 0.2.10 resumes pending research automatically after browser consent and recovers queries from stale chat connections through native MCP. Both saved-login and fresh-consent paths returned Salesforce in the current conversation; see [same-chat recovery acceptance](docs/same-chat-recovery-20261027.md).

## Ready-made files

- [buyercaddy-chatgpt-plugin.zip](https://github.com/BuyerCaddy/chatgpt-plugin/releases/download/v0.2.10/buyercaddy-chatgpt-plugin.zip) - single-plugin portable OAuth package, with a Codex compatibility overlay.
- [buyercaddy-chatgpt-source.zip](https://github.com/BuyerCaddy/chatgpt-plugin/releases/download/v0.2.10/buyercaddy-chatgpt-source.zip) - source, local marketplace, documentation, builders and tests.

These are development/review packages available in the [v0.2.10 GitHub release](https://github.com/BuyerCaddy/chatgpt-plugin/releases/tag/v0.2.10), or build them locally. The GitHub release is not an OpenAI Plugins directory publication. See [installation](plugins/buyercaddy/INSTALL.md), [publication preparation](docs/cloud-release.md), and [verification](docs/verification.md) before distributing the package.

## Build with Python or PowerShell

Run either builder from the repository root. Python 3.11+ uses only the standard library:

```sh
python scripts/package.py
python scripts/package.py --mode source
```

On systems where Python is named `python3`, use that command instead. Windows can use `py -3`.

PowerShell 7+, or Windows PowerShell 5.1, builds the same file contents without Python or Node:

```powershell
./scripts/package.ps1
./scripts/package.ps1 -Mode source
```

The normal output filenames do not contain a version. Version metadata comes from `plugins/buyercaddy/plugin.json`. Each builder replaces only its requested output archive after writing a temporary ZIP successfully. Research uses the hosted MCP server. The optional Codex chat sign-in helper requires Node.js 22+ and the local Codex executable; native host OAuth does not require this helper. Python and PowerShell are build tools, not plugin runtime dependencies.

`--mode local` is an alias for the portable OAuth plugin. The Python-only `--mode cloud --app-id <verified-id>` option remains available for an existing private account binding; it is not the public upload format. Never submit that private `.app.json` archive to the public portal.

## Validate

Development schema tests require Node 22+ and the locked npm dependencies:

```sh
npm ci --ignore-scripts
npm test
python -m unittest discover -s tests -p 'test_*.py'
```

These checks cover packaging, metadata, icons, tool schemas, fixture boundaries and secret exclusion. OAuth gateway tests live in the sibling gateway project. Real ChatGPT sign-in and model-driven calls are separate acceptance checks.

For installed personal-plugin branding, also run `node scripts/check-host-branding.mjs --codex-bin <absolute-codex-executable>`. The [branding acceptance report](docs/branding-host-20261027.md) records the current host icon-metadata failure; valid bundled assets alone do not prove that the application displays them.

## Contents and policies

The plugin contains 18 documented research tool contracts and one [research skill](plugins/buyercaddy/skills/research/SKILL.md). Use [authentication](docs/authentication.md) for the implemented credential flow and [review materials](docs/review-materials.md) for the draft test set and video walkthrough. No payment operation is part of this plugin. Publisher: BuyerCaddy, as confirmed by the owner; platform identity verification remains separate.
