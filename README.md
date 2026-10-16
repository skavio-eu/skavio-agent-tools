# Skavio Agent Tools

Official connection metadata and documentation for Skavio LLC's hosted MCP tools and x402 HTTP API. This repository contains discovery metadata, not the production server source.

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

Published in the official MCP Registry as `eu.skavio/paid-micro-apis`, version `1.0.0`: https://registry.modelcontextprotocol.io/v0.1/servers/eu.skavio%2Fpaid-micro-apis/versions/1.0.0. Other directory registrations are tracked separately. Prices and capabilities may change; inspect current server responses before authorizing payment.
