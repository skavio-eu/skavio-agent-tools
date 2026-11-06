import test from "node:test";
import assert from "node:assert/strict";
import {inspect402,parseUsdcCeiling,preview} from "./skavio-x402.mjs";
const offer={
  x402Version:2,
  accepts:[{scheme:"exact",network:"eip155:8453",asset:"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",amount:"20000",payTo:"0x62BB64E9Ab0E8104dEf0D7845223580319d4C139"}]
};
const encoded=(obj)=>Buffer.from(JSON.stringify(obj)).toString("base64");
test("converts price ceiling safely",()=>{
  assert.equal(parseUsdcCeiling("0.02"),20000n);
  assert.equal(parseUsdcCeiling("1.000001"),1000001n);
  assert.throws(()=>parseUsdcCeiling("-1"));
  assert.throws(()=>parseUsdcCeiling("0.0000001"));
});
test("accepts only verified Base USDC x402 v2 requirements",()=>{
  assert.equal(inspect402(encoded(offer)).amountBaseUnits,20000n);
  assert.throws(()=>inspect402(encoded({...offer,x402Version:1})));
  assert.throws(()=>inspect402(encoded({...offer,accepts:[{...offer.accepts[0],network:"eip155:1"}]})));
  assert.throws(()=>inspect402(encoded({...offer,accepts:[{...offer.accepts[0],payTo:"0x0000000000000000000000000000000000000000"}]})));
  assert.throws(()=>inspect402(encoded({...offer,accepts:[{...offer.accepts[0],amount:"25000"}]})));
  assert.throws(()=>inspect402(encoded({...offer,accepts:[...offer.accepts,...offer.accepts]})));
});
test("free preview does not pay; handles real 402 header",async()=>{
  let count=0;
  const fakeFetch=async(_url,options)=>{
    count++;
    assert.equal(options.method,"GET");
    assert.equal(options.headers.Accept,"application/json");
    assert.equal(options.headers["PAYMENT-SIGNATURE"],undefined);
    return {status:402,headers:new Headers({"payment-required":encoded(offer)})};
  };
  assert.deepEqual(await preview({fetchImpl:fakeFetch}),{
    status:402,network:"eip155:8453",scheme:"exact",priceUSDC:0.02,paid:false
  });
  assert.equal(count,1);
});
