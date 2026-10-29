# Verify USDC transfers using x402 — Skavio Agent Tools

**For:** developers running autonomous agents, marketplaces and payment reconciliation jobs.

Skavio provides separate hosted HTTP x402 endpoints for inspecting native Circle USDC transactions. The fee is paid **per call in native USDC on Base**, and does **not** require a subscription.

| Paid operation | Fee | Result |
| --- | ---: | --- |
| Verify transfer | 0.02 USDC | Transfer and chain settlement evidence |
| Match transfer | 0.03 USDC | Check recipient and exact decimal USDC amount |
| Evidence PDF | 0.05 USDC | Timestamped blockchain transfer evidence |

[API documentation](https://getskavio.com/x402/docs/?utm_source=github&utm_medium=quickstart&utm_campaign=x402_developers_20261023) · [Full overview](https://getskavio.com/x402/?utm_source=github&utm_medium=quickstart&utm_campaign=x402_developers_20261023) · [MCP client configuration](../MCP_CLIENT_SETUP.md)

## 1. Read the free HTTP 402 challenge

This command does **not** authorize or spend USDC:

```bash
curl -i 'https://getskavio.com/x402/v1/usdc/verify?tx_hash=0x98809948204426c574b6f0aabdec03baa996b5c43ce28cc9ca704fa5d07e592e&network=base'
```

An unsigned request normally receives `402 Payment Required`, including a `PAYMENT-REQUIRED` challenge. Check the **requested price, recipient, network, token contract and expiry** before signing anything.

The service uses x402 v2. After an explicit wallet approval, a compatible client can retry the **same request** with a `PAYMENT-SIGNATURE` header. Wallet signing keys must remain in the wallet client — never send seed phrases to Skavio.

## 2. Use the correct operation

For one public transaction, use the **verify** route. To reconcile a buyer against an invoice or order, use **match** with recipient wallet and an exact positive USDC decimal amount (no more than six decimal places). Use **evidence.pdf** to create a bounded blockchain record.

Supported transfer inspection networks include Base, Polygon, Arbitrum, Optimism, Ethereum, Avalanche and finalized Solana, subject to live availability. **Fees still settle on Base**. Blockchain evidence is not a tax invoice or proof of anyone's legal identity.

All query parameters, errors and sample responses are in the [canonical docs](https://getskavio.com/x402/docs/?utm_source=github&utm_medium=quickstart&utm_campaign=x402_developers_20261023).

## 3. Connect the hosted MCP server

Streamable HTTP endpoint: `https://getskavio.com/mcp`

```json
{"mcpServers":{"skavio-usdc":{"url":"https://getskavio.com/mcp"}}}
```

Discovery via `tools/list` is free. A standard MCP client is **not** an x402 payment wallet. Paid MCP calls require an extension that passes the client-authorized payment object through `params._meta["x402/payment"]` on retry.

**Not the same as the document-processing MCP:** PDF, OCR, invoice extraction and transcription relays require separate company authentication and prepaid credits. Do not assume they are payable via the public x402 microservice.

**Next:** [View Skavio x402 prices and connect](https://getskavio.com/x402/?utm_source=github&utm_medium=quickstart&utm_campaign=x402_developers_20261023) or [request integration help](mailto:work@skavio.eu?subject=Skavio%20x402%20integration).

Skavio LLC, October 2026.
