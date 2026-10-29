# Skavio public USDC MCP: integration, data and limitations

**Provider/maintainer:** Skavio LLC · **Contact:** info@getskavio.com · **Last verified:** 29 October 2026  
**Scope:** External, independently hosted MCP; not a hosted service of any marketplace. This GitHub repository is **connection metadata and integration documentation**, **not Skavio's private production server source**.

## Canonical source, endpoint and versions

- **Canonical MCP Streamable HTTP endpoint:** `https://getskavio.com/mcp`
- **Legacy working alias:** `https://www.skavio.eu/mcp` (same observed tools and runtime during the 29 Oct 2026 free handshake). New clients should use the canonical endpoint.
- **Official registry namespace:** `eu.skavio/paid-micro-apis`. A registry **descriptor version** (e.g. 1.1.4 or 1.1.5) is a publication revision, **not** the live server runtime version.
- **Runtime version** returned by MCP `initialize` during this verification: **1.30.0**.
- **Published source metadata:** [repository](https://github.com/skavio-eu/skavio-agent-tools), [registry](https://registry.modelcontextprotocol.io/v0.1/servers/eu.skavio%2Fpaid-micro-apis/versions/latest).
- **Published privacy:** https://getskavio.com/privacy/ · **Terms:** https://getskavio.com/terms/

## Access types and prices

Free operations: MCP protocol `initialize` and `tools/list`; `skavio_catalog` (price/discovery) and `skavio_launch_status` (availability). Free discovery requires no wallet or payment.

**Public x402 MCP paid tools, prices per call in native Circle USDC:**

| Tool | USDC | Output |
| --- | ---: | --- |
| `verify_native_usdc` | 0.02 | Read-only native USDC transfer facts and finality |
| `match_native_usdc_payment` | 0.03 | Exact recipient + positive six-decimal USDC amount match |
| `usdc_transfer_evidence_pdf` | 0.05 | Blockchain transaction evidence PDF; **not an invoice** |
| `domain_dns_tls_audit` | 0.05 | Public DNS/TLS check of **one public hostname**; not security certification or a vulnerability scan |

**MCP payment settlement:** x402 MCP v2, exact native Circle USDC on Base (`eip155:8453`) and Solana (`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`). A wallet-capable client obtains the quote then supplies its own signed payment in `params._meta["x402/payment"]`. Ordinary MCP clients cannot automatically pay; credentials/seed phrases must never be submitted to Skavio or partners.

**Transaction inspection networks**, distinct from fee settlement, are Base, Polygon, Arbitrum, Optimism, Ethereum, Avalanche, and Solana. The **standalone HTTP x402 API** always settles on **Base** even when inspecting other chains. It separately lists USDC Verify (0.02), Match (0.03), Evidence PDF (0.05) and Web Fetch (0.01), Search (0.02), Extract (0.02), Extract + Analyze (0.03) per HTTP request. Discovery [manifest](https://getskavio.com/.well-known/x402) and [OpenAPI](https://getskavio.com/x402/openapi.json) describe exact resource constraints.

**Separate tenant-authenticated MCP tools:** 9 company processing tools (`web_fetch`, `web_extract`, `web_monitor`, `pdf_to_text`, `document_ocr`, `invoice_extract`, `audio_transcribe`, `pdf_split`, `pdf_merge`) plus 3 own-job/wallet lookup tools (`skavio_agent_job_status`, `skavio_agent_job_result`, `skavio_agent_wallet`). Processing needs the company's own valid Bearer credential, permissions and prepaid balance / an approved x402 quote. Own-job and wallet lookups incur no new payment but require proper identity. These tools being in public discovery **does not** grant unauthorized access. See [current Agent Tools prices](https://getskavio.com/agent-tools/api/pricing) and the separate OAuth server `https://getskavio.com/processing/mcp`.

## Data collected, retention and external services

**Public verification input:** the chain identifier and existing public transaction hash (EVM 32-byte hex) or Solana signature; match additionally receives a public recipient wallet address and expected positive USDC amount. The PDF creates a bounded record from public on-chain facts. **DNS/TLS audit** receives a public hostname and resolves publicly routable addresses and TLS certificate details; it does not crawl the website or scan private hosts. No sensitive customer documents, wallet secrets or private keys are required for these public tools.

Read-only blockchain validation queries **external public RPC endpoints** for existing transactions and chain state; a public RPC provider necessarily receives the public transaction/query details and can apply its own request logs. These include public infrastructure for supported EVM networks and Solana's public RPC. Public DNS infrastructure and the target TLS host see DNS/TLS requests for domain audits. Access via HTTPS/CDN and hosting involves normal network/security/request metadata.

**Retention is category-specific:** authorized x402 settlement creates durable transaction, receipt, idempotency and reconciliation records. Security, usage, abuse and HTTP request metadata can also be retained. There is **no promise of zero retention**, nor a blanket deletion of payment/audit records in 7 days. The published privacy policy's approximately **7-day default** generally concerns separate customer-submitted processing source/results, subject to settings, legal retention and backups. Payment/accounting/audit records and backups follow their own retention rules. Third-party RPC and infrastructure providers have separate operational practices. See [privacy policy](https://getskavio.com/privacy/) sections 3, 7, 9 and 10. No user data is claimed to be sold for targeted advertising.

The inspected blockchain transfer is public and read-only. Skavio does not custody inspected funds or ask for wallet keys. A **separate payment authorization** is needed for any paid invocation, not for free discovery.

## Independently verified storage separation and backup policy (29 October 2026)

- **Application host:** dedicated AX41 production app/processing system; it is not the customer database server.
- **Structured customer and processing records:** independent PostgreSQL host (DB01), reached via private networking and TLS `verify-full` certificate validation.
- **Customer file objects:** separate UpCloud S3-compatible Object Storage in the **Europe-2** region. Tenant-scoped object access and S3 server-side encryption were tested. Application processes may temporarily access payloads and hold local working caches during work.
- **Current live retention configuration:** all 33 company storage policies have 7-day defaults for sources, processed results and user archives; a 15-minute guard maintains these defaults for newly created accounts, and the production application performs expired-object cleanup around hourly, except active/pinned jobs and authorized legal holds.
- **Separate encrypted offsite Borg snapshots:** S3 object backups are scoped to **7 days**; full-server disaster-recovery backups are scoped to **14 days**. Separate financial/accounting recovery archives are excluded from this automatic prune because their retention obligations differ. Pruning and physical Borg compaction run under the same cross-job lock after successful backups, with freshness checks. Existing offsite historical archives can therefore hold copies after deletion from live S3, until their own backup window expires.
- **Verification:** on 29 October four expired S3 snapshots were pruned; compaction reclaimed approximately 177 MB; sample files were restored both before and after pruning, including the S3 archive structure and a database-backup manifest. This is a sample **restore smoke test**, not a complete recovery of all databases or an independent disaster-recovery SLA certification.
- **Limit:** historical customer data may still exist in older full-host backups and processing caches during their permitted lifecycle. We cannot claim global zero-data retention or irrevocable deletion from every backup after exactly seven days.

## Reproducible free inspection — no payment

1. `initialize` and `tools/list` on `https://getskavio.com/mcp` using MCP Streamable HTTP and Accept `application/json, text/event-stream`. As of 29 October, both the canonical and legacy aliases report runtime `1.30.0` and 18 tools.
2. Call `skavio_catalog` for free price, network and access discovery.
3. Run **without a wallet or signed payment**:

```bash
curl -i 'https://getskavio.com/x402/v1/usdc/verify?tx_hash=0x98809948204426c574b6f0aabdec03baa996b5c43ce28cc9ca704fa5d07e592e&network=base'
```

Expected observed behavior on 29 Oct: HTTP **402**, with x402 v2 `PAYMENT-REQUIRED` advertising Base `eip155:8453`, native USDC and amount **20000 atomic units = 0.02 USDC**. This is **not** a confirmed paid tool execution. No external reviewer should spend funds without separate approval.

**Material limitations:** finality and RPC latency vary; an unconfirmed/unavailable transaction can return a mismatch, missing status or error; no fixed latency/SLA claim. Supported native Circle USDC contract only, not every bridged token. Evidence PDFs are not tax invoices. DNS/TLS results are point-in-time checks, not full security audits. Authenticated processing and live customer data fall outside this initial documentation-only pilot.

Further [x402 docs](https://getskavio.com/x402/docs/), [MCP client setup](../MCP_CLIENT_SETUP.md) and [USDC walkthrough](verify-usdc-with-x402.md). Reviewers should record the exact runtime response, registry descriptor revision and date when drawing conclusions.
