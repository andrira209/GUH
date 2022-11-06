import BigNumber from "bignumber.js";
import { ParsedUrlQuery } from "querystring";

export function calculateSolPrice(query: ParsedUrlQuery): BigNumber {
  let amount = new BigNumber(0);
  for (let [id, quantity] of Object.entries(query)) {
    const productQuantity = new BigNumber(quantity as string);
    amount = amount.plus(productQuantity);
  }

  return amount;
}
