# Skavio Agent Tools

Official connection metadata and documentation for Skavio LLC's hosted MCP tools and x402 HTTP API. This repository contains discovery metadata, not the production server source.

**New practical guide:** [Verify an incoming USDC transfer from an AI agent using x402](guides/verify-usdc-with-x402.md) — live 0.02/0.03/0.05 USDC operation prices, free HTTP 402 discovery and payment-safe steps. [Try the hosted endpoint](https://www.skavio.eu/x402/?utm_source=github&utm_medium=readme&utm_campaign=x402_developers_20261023).

[**Authenticated Web Search, Extraction & Monitoring (Agent Tools)**](WEB_TOOLS.md) — three production web operations with Serper search, original HTTPS source extraction, SHA-256 change monitoring and optional DeepSeek diagnostics. Requires a company Agent Tools Bearer key; separate from public x402 verification.

## Use Skavio in Cursor and Claude Desktop

[**Connection instructions and ready-to-copy Cursor / Claude Desktop JSON**](MCP_CLIENT_SETUP.md) · [Cursor config](examples/cursor-mcp.json) · [Claude Desktop config](examples/claude-desktop-mcp.json). The publicly discoverable MCP server is `https://www.skavio.eu/mcp`; separate OAuth-protected Processing MCP is at `https://www.skavio.eu/processing/mcp`. Plain MCP clients do **not** automatically process x402 payments.

Connect an MCP client using Streamable HTTP at **https://www.skavio.eu/mcp**. Discovery and the `skavio_catalog` tool are free. Paid invocations use x402 MCP v2: inspect `PaymentRequired`, then retry with an authorization supplied by your wallet client in `params._meta["x402/payment"]`. Keep wallet keys in your own client. Payment uses native Circle USDC on Base (`eip155:8453`). Obtain current payment requirements from the service.

| Tool | Advertised USDC per invocation | Purpose |
| --- | ---: | --- |
| skavio_catalog | Free | Discover capabilities |
| verify_native_usdc | 0.02 | Inspect native USDC transfer evidence |
| match_native_usdc_payment | 0.03 | Match recipient and exact amount |
| usdc_transfer_evidence_pdf | 0.05 | Receive bounded blockchain evidence PDF |
| domain_dns_tls_audit | 0.05 | Bounded public-domain DNS/TLS audit |

Transfer inspection supports Base, Polygon, Arbitrum, Optimism, Ethereum, Avalanche and Solana. Payment remains on Base. Evidence PDFs are not tax invoices.

HTTP documentation: https://www.skavio.eu/x402/docs

Three HTTP routes are advertised: `/x402/v1/usdc/verify`, `/x402/v1/usdc/match`, `/x402/v1/usdc/evidence.pdf`. Use the documented query parameters and a compatible x402 client.

Public unsigned challenge and discovery checks do not establish successful funded settlement or profitability. No revenue claim is made. The current public `tools/list` also advertises tenant-authenticated document, OCR, invoice, audio and web Agent Tools. These require a valid Agent Tools credential and cannot be used anonymously. The **separate** OAuth-protected Processing API and its developer kit are at https://github.com/skavio-eu/skavio-processing-api.

Published in the official MCP Registry as `eu.skavio/paid-micro-apis`, version `1.1.2`: https://registry.modelcontextprotocol.io/v0.1/servers/eu.skavio%2Fpaid-micro-apis/versions/1.1.2. Other directory registrations are tracked separately. Prices and capabilities may change; inspect current server responses before authorizing payment.

<!-- discovery-release-20261017 -->

## USDC payment verification for AI agents

Skavio USDC Payment Verification — x402 API inspects native Circle USDC transfers, matches an exact recipient and decimal amount, and generates blockchain evidence PDFs. Use it for merchant payment reconciliation, accountant transaction review and agent workflows. PDF evidence is not a tax invoice or a guarantee of third-party authorization.

- HTTP Verify: **0.02 native USDC**; Match: **0.03 USDC**; PDF: **0.05 USDC**. Payment settles separately on **Base** through x402 v2. Inspection supports Base, Polygon, Arbitrum, Optimism, Ethereum, Avalanche and finalized Solana.
- [API quickstart, schemas, errors and client configurations](https://www.skavio.eu/x402/docs/) · [three-route discovery](https://www.skavio.eu/.well-known/x402) · [OpenAPI](https://www.skavio.eu/x402/openapi.json).
- [Skavio USDC Payment Verification & Proof MCP](https://registry.modelcontextprotocol.io/v0.1/servers/eu.skavio%2Fpaid-micro-apis/versions/1.1.2), version **1.1.2**. Stable registry namespace and tool IDs are unchanged. Connect using `https://www.skavio.eu/mcp` (Streamable HTTP).
- MCP has four paid blockchain/domain tools (`verify_native_usdc`, `match_native_usdc_payment`, `usdc_transfer_evidence_pdf`, `domain_dns_tls_audit`), two free discovery tools, and twelve separate authenticated AgentTools processing/job/wallet relays. The DNS/TLS audit is 0.05 USDC and is not a vulnerability scan.
- **A standard MCP client without a wallet x402 extension cannot automatically pay.** Discovery is free. Paid MCP retries preserve `params._meta["x402/payment"]`; HTTP retries use `PAYMENT-SIGNATURE`. Never send a private key or seed phrase. No custody or automatic spending is created by adding a server.
- PayAPI publishes separate live listings and historical settlement receipts for [HTTP Verify, 0.02 USDC](https://payapi.market/api/skavio-usdc-transaction-verification), [exact recipient/amount Match, 0.03 USDC](https://payapi.market/api/skavio-usdc-recipient-and-amount-match), and [blockchain PDF evidence, 0.05 USDC](https://payapi.market/api/skavio-usdc-verification-and-pdf-payment-evidence). Each route was independently read back on 2026-10-17, and each prior Base USDC receipt was checked read-only. No new payment was made for this documentation update. This is blockchain evidence, not a tax invoice.
- RPC availability and finality affect results. No fixed latency SLA is promised. EVM requests use a 32-byte 0x hash; Solana uses its transaction signature. Match takes a recipient wallet and a positive exact USDC decimal string with at most six decimal places.

Cursor `.cursor/mcp.json`:

```json
{"mcpServers":{"skavio-usdc":{"url":"https://www.skavio.eu/mcp"}}}
```

Claude Code:

```sh
claude mcp add --transport http skavio-usdc https://www.skavio.eu/mcp
```

Claude Desktop with Node.js and a reviewed stdio-to-HTTP bridge:

```json
{"mcpServers":{"skavio-usdc":{"command":"npx","args":["-y","mcp-remote","https://www.skavio.eu/mcp"]}}}
```

The bridge may download a third-party package and does not supply wallet payment support. Current Desktop remote connectors may accept the HTTPS URL directly.

First unpaid request (no signing or transfer):

```sh
curl -i 'https://www.skavio.eu/x402/v1/usdc/verify?tx_hash=0x98809948204426c574b6f0aabdec03baa996b5c43ce28cc9ca704fa5d07e592e&network=base'
```

Expect HTTP 402 and decode `PAYMENT-REQUIRED`. Inspect the exact amount, Base USDC asset and recipient before authorizing an x402 wallet client; only then retry the same request. After an ambiguous response, inspect recovery state instead of blindly paying again.

Separate [Skavio PDF, OCR & Document Processing MCP](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.skavio-eu%2Fprocessing/versions/0.2.7), version **0.2.7**, uses company OAuth at `https://www.skavio.eu/processing/mcp` and shared prepaid credits. [Processing docs](https://www.skavio.eu/processing/docs/mcp/) explain company ownership and measured jobs. Optional AgentTools relays require the caller's own key and current backend availability; preserve the idempotency key, poll status, download results and verify SHA256. HTTP `/x402/v1/processing` stays disabled.
