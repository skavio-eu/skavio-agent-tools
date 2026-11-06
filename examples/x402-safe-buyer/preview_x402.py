#!/usr/bin/env python3
"""Free x402 v2 quote inspection for Skavio. No wallet, no private key, no payment."""
import base64
import json
from urllib import request, error

URL = ("https://getskavio.com/x402/v1/usdc/verify"
       "?tx_hash=0x98809948204426c574b6f0aabdec03baa996b5c43ce28cc9ca704fa5d07e592e&network=base")
USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".lower()
PAY_TO = "0x62BB64E9Ab0E8104dEf0D7845223580319d4C139".lower()

def inspect(header, max_microusd=20_000):
    if not header:
        raise ValueError("Missing PAYMENT-REQUIRED header")
    details = json.loads(base64.b64decode(header, validate=True))
    if details.get("x402Version") != 2:
        raise ValueError("Unsupported x402 version")
    accepts = [p for p in details.get("accepts", [])
               if p.get("network") == "eip155:8453"
               and p.get("scheme") == "exact"
               and str(p.get("asset", "")).lower() == USDC
               and str(p.get("payTo", "")).lower() == PAY_TO
               and str(p.get("amount", "")).isdigit()]
    if len(accepts) != 1 or not 0 < int(accepts[0]["amount"]) <= max_microusd:
        raise ValueError("Unexpected or over-budget payment requirements")
    return {"network": accepts[0]["network"],
            "price_usdc": int(accepts[0]["amount"]) / 1_000_000,
            "paid": False, "status": 402}

def main():
    try:
        with request.urlopen(request.Request(URL, headers={"Accept": "application/json"}), timeout=15) as response:
            raise RuntimeError("Expected unpaid HTTP 402, got " + str(response.status))
    except error.HTTPError as exc:
        if exc.code != 402:
            raise RuntimeError("API returned HTTP " + str(exc.code)) from None
        print(json.dumps(inspect(exc.headers.get("payment-required")), indent=2))
        print("This is a quote only, NOT a payment or a settlement.")

if __name__ == "__main__":
    main()
