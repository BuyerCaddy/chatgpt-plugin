# Branding acceptance: personal plugin icon loss

## Finding

BuyerCaddy 0.2.7 contains the original 300 × 300, 5,046-byte PNG. The portable and compatibility manifests set both logo and composerIcon to `./assets/buyercaddy-icon.png`, as required by the [official package documentation](https://developers.openai.com/plugins/deploy/submission). Source and installed file hashes match.

On 2026-10-27 a forced personal-plugin inventory refresh and plugin/read both returned null for composerIcon, composerIconUrl, logo, logoDark, logoUrl and logoUrlDark. Both remote and installed versions were 0.2.7, installed/enabled were true, and the original remote identity was preserved. Thus checking the installed manifest alone had missed a real presentation failure.

A read-only plugin/read against the local marketplace for the same source returned existing absolute paths for composerIcon and logo. It did not install a duplicate or change account settings. This isolates the discrepancy to the personal/account metadata route; it is not proof of rendered UI acceptance for a local installation.

Read-only inspection of the installed desktop renderer confirms that plugin mentions select a composer icon/logo when metadata supplies one and otherwise use a generic fallback. The metadata path therefore explains the user's generic icon. The signed desktop application was not modified.

The same failure is reported in the open upstream [Codex issue #55762](https://github.com/openai/codex/issues/55762), including a controlled manifest-format experiment that did not fix it and a proposed source patch. The report remained open when inspected. No supported private-package correction has been established; do not churn releases, add undocumented URL fields, duplicate the plugin, or claim a production fix based on a local-only workaround.

## Repeatable acceptance gate

Run from this repository with Node 22+ and the absolute path to the actual running Codex binary:

```text
node scripts/check-host-branding.mjs --codex-bin <absolute-codex-executable>
```

This refreshes metadata only. It does not install, log in, inspect credentials, query business data or modify configuration. Exit 0 means list/detail both expose nonempty image references and the enabled installed version matches. Exit 2 means branding metadata is not ready. Exit 1 means the inspection itself failed. A passing metadata check still requires visually checking the picker and sent-message mention.

Current result: `metadata_not_ready`; both composer and logo absent in list/detail. Treat this as an open production presentation defect, not as a package-test failure or a successfully fixed icon.

## Remaining acceptance

After an upstream fix becomes available, run the gate, then verify the actual BuyerCaddy icon in the picker and a new sent mention. Preserve the account plugin, existing OAuth and original artwork. No new plugin release is needed merely to restate the already correct asset paths.
