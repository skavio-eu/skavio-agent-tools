# Skavio x402 buyer integration — free inspection + opt-in payment

Production: [Skavio x402 v2 API](https://getskavio.com/x402/docs/) · [OpenAPI](https://getskavio.com/x402/openapi.json) · [No-account sample gallery](https://getskavio.com/demo/)

**What this code demonstrates:** a buyer agent checks a real unsigned HTTP 402 quote for Skavio USDC Transfer Verify, ensures the payment offer is **x402 v2 / exact USDC on Base (eip155:8453) / correct recipient / no more than 0.02 USDC**, and only pays if a developer **explicitly opts in**. The free sample and inspection mode do not sign, settle, or spend anything.

## No wallet, no account, no cost (recommended start)

```bash
python3 preview_x402.py
node skavio-x402.mjs --preview
node --test
```

These fetch a real HTTP 402 challenge; **402 means payment is required, not made**. The main demonstration API is a read-only lookup of a public sample transaction on Base.

## Paid Base mainnet call (explicit opt-in only)

Requires Node.js 22+, `npm install`, and a dedicated wallet with a **small capped balance** of Base native Circle USDC; use a secret manager for wallet keys. Never commit credentials, do not expose secrets to a browser, and do not reuse the company treasury wallet.

```bash
npm install
export SKAVIO_X402_MAX_USDC="0.02"
# Set SKAVIO_X402_PRIVATE_KEY securely outside shell history, e.g. from your key manager.
node skavio-x402.mjs --pay
```

Only `--pay` triggers the paid x402 client. The code rechecks the network, token, recipient and maximum payment before passing the request to `@x402/fetch` and `@x402/evm`. The included transaction hash comes from Skavio's public discovery listing. A final HTTP 200 alone is **not proof of confirmed settlement**; read and verify the `PAYMENT-RESPONSE` receipt and on-chain payment record before recording a successful paid acquisition.

**What has been tested:** HTTP 402 challenge against the live production endpoint and offline unit tests of the free preview and the cap. No funded wallet call was made in preparing this example. Network changes, recipients or fees outside the listed allowlist fail closed. Default budget is 0.02 USDC per **call**, not a fleet-wide/monthly quota; set your own cumulative budget in the agent before unattended use.

## Extend to agent execution

In a buyer agent, use `preview()` for an initial quote before any spending, budget the task, then only use `--pay` or extract the payment helper into an authorized action. Do not automate ad-hoc 402 retries without idempotency and payment reconciliation.

Processing and PDF/OCR/Flow API uses **separate company authentication and prepaid credits**. For the no-login demonstration see [getskavio.com/demo](https://getskavio.com/demo/); for actual integrations see the [Skavio Processing API](https://github.com/skavio-eu/skavio-processing-api). This repository does not make the paid processing API anonymous.

Support: https://getskavio.com/contact/ · transparency: Skavio LLC maintains this code.
