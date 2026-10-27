# Review cases and demo walkthrough

The canonical five positive and three negative cases are in `plugins/buyercaddy/plugin.json` under `extensions.com.openai.review.test_cases`. They cover exact vendor lookup, scoped company search, company stack, continuation, company profiles, credential handling, unauthorized delegation and unsupported outreach. Expectations use real tool names and schema arguments. All cases are **Not run in ChatGPT** until a real host connection and reviewer account are available. Schema tests do not change that status.

## Dedicated reviewer access

Use a dedicated BuyerCaddy test account and API credential with access to company/vendor/stack tools and sufficient service access. Put login/consent instructions and the credential only in the secure portal reviewer fields. The current gateway asks for the API key on its own HTTPS consent page, so supply that exact secure sign-in method. Do not ask reviewers to register, use the owner's mailbox or access a private network. Keep access working for later reviews.

## Record an actual walkthrough

1. In the target ChatGPT environment, show BuyerCaddy installed and connected. If showing setup, hide credential entry and avoid recording tokens or the callback URL query.
2. Run the vendor prompt, then the Germany/Salesforce company prompt. Show tool calls, returned scope and bounded results.
3. Run the microsoft.com five-product prompt followed by the next-five prompt in the same chat. Show continuation without a reset.
4. Request a company profile and show only returned fields. Use sample account data appropriate for review.
5. Run the three negative prompts and show that purchases, unauthorized account access and outbound email are not attempted.
6. Review playback for readable text and secrets, host the real recording at a reviewer-accessible URL, add that verified URL to the manifest, and rebuild.

This is a recording script, not a completed video. No recording tool or host connection has yet been exercised for these cases. A publication-ready archive needs a real playable demo and execution evidence.
