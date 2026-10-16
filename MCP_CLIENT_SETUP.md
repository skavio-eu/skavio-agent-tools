# Connect Skavio MCP to Cursor, Claude Desktop and Claude Code

**Provider:** [Skavio LLC](https://www.skavio.eu/)
**Protocol:** MCP Streamable HTTP
**Current live endpoints:**

| Service | Server URL | Access |
| --- | --- | --- |
| Agent Tools / paid micro-APIs | `https://www.skavio.eu/mcp` | Public discovery; x402-paid tools and separately authenticated Agent Tools |
| Processing MCP | `https://www.skavio.eu/processing/mcp` | OAuth or a valid company-specific MCP credential, with prepaid Processing credits |

These two servers are **not interchangeable**. In particular, being connected to an MCP server does not itself authorize x402 payments.

## Cursor (remote HTTP)

Create a project-level `.cursor/mcp.json` or a global `~/.cursor/mcp.json`. Copy [this tested JSON format](examples/cursor-mcp.json):

```json
{
  "mcpServers": {
    "skavio-paid-tools": {
      "type": "http",
      "url": "https://www.skavio.eu/mcp"
    }
  }
}
```

Open Cursor settings / MCP servers and enable **skavio-paid-tools**. The free tools `skavio_launch_status` and `skavio_catalog` are available for capability and price discovery. The server also advertises USDC verification, exact match, evidence PDF and DNS/TLS audits, plus tenant-authenticated Agent Tools. They have **additional authorization/payment requirements**, described below.

To add the separate document-processing server, add another entry:

```json
"skavio-processing": {
  "type": "http",
  "url": "https://www.skavio.eu/processing/mcp"
}
```

This is a *fragment*, to merge into the existing `mcpServers` JSON object. Cursor must finish the advertised OAuth sign-in to use Processing tools. The server intentionally responds HTTP 401 without credentials. OAuth support is server-side; a real sign-in should be verified in the user's client.

## Claude Desktop and Claude.ai (preferred: remote connector)

1. Go to **Settings → Connectors → Add custom connector** in Claude.
2. Set the name to **Skavio Paid Tools** and URL to `https://www.skavio.eu/mcp`.
3. Save, select available tools and ask Claude to run `skavio_catalog` or `skavio_launch_status`.

For document-processing tools, add another remote connector named **Skavio Processing** at `https://www.skavio.eu/processing/mcp`. Complete the service's OAuth authorization if offered. This is not the same as pasting a bearer key into a public chat.

Claude Desktop also supports a local STDIO bridge where compatible. If you need a JSON-based local client instead of a remote connector, install Node.js / npm and use [this sample config](examples/claude-desktop-mcp.json) in your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "skavio-paid-tools": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://www.skavio.eu/mcp"]
    }
  }
}
```

Restart the desktop app after changing local configuration. This bridge is **only a transport adapter**, not an x402 wallet or automatic payment tool. Prefer native remote connectors when supported.

## Claude Code

A remote MCP example:

```bash
claude mcp add --transport http skavio-paid-tools https://www.skavio.eu/mcp
```

Follow Claude Code's own MCP authorization instructions before connecting the *separate* Processing endpoint.

## Payment and security rules

- `skavio_catalog` and `skavio_launch_status` are **free**. Always inspect current live prices before requesting a paid operation.
- The USDC verification micro-APIs charge via **x402**, settled in native Circle USDC on **Base**; a plain Cursor / Claude MCP connection will **not** automatically fund or settle payments. Use an x402-capable payment client and approved wallet authorization.
- Tenant Agent Tools (e.g. `document_ocr`, `invoice_extract`, `web_extract`) require an appropriate **Agent Tools Bearer API credential** and have account-based accounting. Listing a tool is not a promise of anonymous execution.
- Processing MCP uses separate company-scoped OAuth or MCP credentials and **shared prepaid processing credits**; never reuse an ordinary Processing API key as an MCP bearer credential.
- Do not paste API keys, wallet seed phrases, private keys, company documents or paid payloads into public repositories or sample files.
- Use the live `tools/list`, `skavio_catalog` and relevant documentation as the source of truth if current prices or availability change.

## Discovery

- [Official MCP Registry: Skavio paid micro-APIs](https://registry.modelcontextprotocol.io/v0/servers?search=skavio)
- [Skavio Processing API developer kit](https://github.com/skavio-eu/skavio-processing-api)
- [Processing MCP documentation](https://www.skavio.eu/processing/docs/mcp/)
- [HTTP x402 catalog and docs](https://www.skavio.eu/x402/docs)
- [PayAPI Market](https://payapi.market/) — independent marketplace to which Skavio submitted three API listings; review/publication remains under PayAPI's control.

**Verification performed 2026-10-16:** public `/mcp` initialized successfully and returned 18 tools; `/processing/mcp` responded with HTTP 401 and OAuth protected-resource metadata when unauthenticated. Cursor and Claude client-specific sign-in and paid x402 settlement require separate real-client verification; do not infer that those stages passed from the discovery probes.
