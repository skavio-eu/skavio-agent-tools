// Skavio x402 v2 buyer: free 402 quote by default; optional explicit mainnet payment.
// Node.js 22+, wallet stays local. No account required for the free preview.
import { pathToFileURL } from "node:url";

export const BASE = "https://getskavio.com";
export const VERIFY_URL = BASE + "/x402/v1/usdc/verify?tx_hash=0x98809948204426c574b6f0aabdec03baa996b5c43ce28cc9ca704fa5d07e592e&network=base";
export const BASE_NETWORK = "eip155:8453";
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".toLowerCase();
export const SELLER_ADDRESS = "0x62BB64E9Ab0E8104dEf0D7845223580319d4C139".toLowerCase();

export function parseUsdcCeiling(raw = "0.02") {
  if (!/^\d{1,3}(?:\.\d{1,6})?$/.test(raw)) throw new Error("Invalid max spend; use 0.02 for 0.02 USDC");
  const [whole, fraction = ""] = raw.split(".");
  return BigInt(whole) * 1_000_000n + BigInt((fraction + "000000").slice(0, 6));
}

export function inspect402(encoded, ceiling = 20_000n) {
  if (!encoded) throw new Error("Missing PAYMENT-REQUIRED header");
  const requirements = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  if (requirements.x402Version !== 2 || !Array.isArray(requirements.accepts)) {
    throw new Error("Expected an x402 v2 payment challenge");
  }
  const compatible = requirements.accepts.filter(p =>
    p.scheme === "exact" &&
    p.network === BASE_NETWORK &&
    String(p.asset || "").toLowerCase() === USDC_BASE &&
    String(p.payTo || "").toLowerCase() === SELLER_ADDRESS &&
    /^\d+$/.test(String(p.amount))
  );
  if (compatible.length !== 1) throw new Error("Unexpected or ambiguous payment asset/network/receiver");
  const choice = compatible[0];
  if (BigInt(choice.amount) > ceiling) throw new Error("Seller price exceeds the approved single-call cap");
  if (BigInt(choice.amount) <= 0n) throw new Error("Invalid USDC amount");
  return {requirements, choice, amountBaseUnits:BigInt(choice.amount)};
}

export async function preview({fetchImpl=fetch, maxUsdc="0.02"} = {}) {
  const response = await fetchImpl(VERIFY_URL, {
    method:"GET", redirect:"error", signal:AbortSignal.timeout(20_000),
    headers:{"Accept":"application/json"}
  });
  if (response.status !== 402) throw new Error("Expected unpaid HTTP 402; got " + response.status);
  const parsed = inspect402(response.headers.get("payment-required"), parseUsdcCeiling(maxUsdc));
  return {
    status: response.status,
    network: parsed.choice.network,
    scheme: parsed.choice.scheme,
    priceUSDC: Number(parsed.amountBaseUnits) / 1_000_000,
    // 402 is a quote, never a completed payment.
    paid: false
  };
}

async function payExplicitly({maxUsdc="0.02"} = {}) {
  const key = process.env.SKAVIO_X402_PRIVATE_KEY;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key || "")) {
    throw new Error("Payment requires a dedicated wallet secret in SKAVIO_X402_PRIVATE_KEY (not printed)");
  }
  const allowed = parseUsdcCeiling(maxUsdc);
  // Preflight must succeed BEFORE initializing payment-capable clients.
  await preview({maxUsdc});
  const [{wrapFetchWithPaymentFromConfig}, {ExactEvmScheme}, {privateKeyToAccount}] = await Promise.all([
    import("@x402/fetch"),import("@x402/evm"),import("viem/accounts")
  ]);
  const payer = privateKeyToAccount(key);
  const paidFetch = wrapFetchWithPaymentFromConfig(fetch,{
    schemes:[{network:BASE_NETWORK,client:new ExactEvmScheme(payer)}],
    paymentRequirementsSelector:(version,accepts)=>{
      if (version !== 2) throw new Error("Refusing unsupported x402 version");
      const options = accepts.filter(p=>p.scheme==="exact" &&
         p.network===BASE_NETWORK &&
         String(p.asset || "").toLowerCase()===USDC_BASE &&
         String(p.payTo || "").toLowerCase()===SELLER_ADDRESS &&
         /^\d+$/.test(String(p.amount)) && BigInt(p.amount)<=allowed);
      if (options.length!==1)throw new Error("Payment requirements differ from preflight");
      return options[0];
    }
  });
  const response=await paidFetch(VERIFY_URL,{method:"GET",redirect:"error",signal:AbortSignal.timeout(30_000)});
  if (!response.ok) throw new Error("Paid API returned HTTP " + response.status);
  const data=await response.json();
  // Payment settlement is not proven merely by HTTP 200; inspect PAYMENT-RESPONSE.
  const proof=response.headers.get("payment-response");
  if (!proof)console.error("Warning: no PAYMENT-RESPONSE receipt header; verify settlement separately.");
  console.log(JSON.stringify({status:response.status,data,hasPaymentResponse:!!proof},null,2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag=process.argv[2] || "--preview";
  const cap=process.env.SKAVIO_X402_MAX_USDC || "0.02";
  if (flag==="--preview") preview({maxUsdc:cap}).then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e.message);process.exitCode=1});
  else if (flag==="--pay") payExplicitly({maxUsdc:cap}).catch(e=>{console.error(e.message);process.exitCode=1});
  else {console.error("Usage: node skavio-x402.mjs [--preview|--pay]");process.exitCode=2;}
}
