# Skavio Web Search, Extraction & Monitoring (Agent Tools / MCP)

**Production:** `https://getskavio.com/agent-tools/mcp` (Streamable HTTP, Skavio company Agent Tools Bearer API key). OpenAPI: `https://getskavio.com/agent-tools/api/openapi.json`. Public paid MCP `https://getskavio.com/mcp` also advertises these authenticated AgentTools relays, alongside separate x402 payment verification tools. An anonymous call cannot execute customer processing.

## Supported tools

| Tool | HTTPS URL input | Serper Google query input | Optional DeepSeek diagnosis |
|---|---|---|---|
| `web_fetch` | Securely fetch page text | Return bounded search results and source URLs | Yes |
| `web_extract` | Extract readable source text | Search and fetch text from up to five real HTTPS sources | Yes |
| `web_monitor` | Hash page content with SHA-256; compare previous hash | Hash/compare bounded search results | Yes |

Specify **one** of `url` or `query`; the two modes are mutually exclusive. Query mode allows up to ten results; `web_extract` permits `fetch_top` from one to five pages. `diagnose: true` requests optional DeepSeek analysis, not a substitute for source verification. HTTPS, redirects, robots, DNS, SSRF, content type and response-size limits apply.

## AgentTools prepaid-credit prices (USD equivalent)

One credit = **$0.001**. The exact quote depends on arguments and any requested diagnosis.

| Operation | URL | URL + DeepSeek | Serper query | Query + DeepSeek |
|---|---:|---:|---:|---:|
| `web_fetch` | 1 credit | 5 credits | 2 credits | 7 credits |
| `web_extract` | 1 credit | 5 credits | 3 credits | 7–8 credits |
| `web_monitor` | 1 credit | 5 credits | 2 credits | 7 credits |

These are distinct from public **x402 Verify 0.02, Match 0.03, PDF 0.05 USDC**, which remain unchanged. Operations require a valid company account, authorization and supported payment/credit balance. Listing, quotation and admission are not evidence of a completed settlement or delivered result.

## Example job request

```http
POST https://getskavio.com/agent-tools/api/jobs
Authorization: Bearer YOUR_AGENT_TOOLS_API_KEY
Content-Type: application/json
```

```json
{"tool":"web_fetch","idempotency_key":"search-company-001","arguments":{"query":"site:example.com release notes","max_results":5,"diagnose":false}}
```

Poll the resulting job by the original `idempotency_key`, then download owned results through the authenticated API; verify SHA-256 when supplied. Do not change tool, arguments or payment mode when retrying the same key.

For MCP clients use `https://getskavio.com/agent-tools/mcp` with a Bearer key and its live `tools/list` schemas. Public `/mcp` has separate x402 handling; do not confuse the two services. The third-party directories may lag the live service until their cache/index is refreshed.

Verified publicly on 18 October 2026: live AgentTools and paid MCP `tools/list` both advertise three web tools with `query` and `url` schemas. No funded public MCP settlement is claimed by this document.
