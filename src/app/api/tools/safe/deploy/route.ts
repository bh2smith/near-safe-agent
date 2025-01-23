import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "../../util";
import { Address } from "viem";
import { isContract } from "near-safe";
import { safeUrl } from "../util";
import {
  addressField,
  FieldParser,
  handleRequest,
  NULL_TRANSACTION,
  numberField,
  signRequestFor,
  TxData,
  validateInput,
} from "@bitte-ai/agent-sdk";

interface Input {
  chainId: number;
  safeAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  safeAddress: addressField,
};

async function logic(req: NextRequest): Promise<TxData> {
  const headerError = await validateRequest(req);
  if (headerError) throw headerError;
  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  const { chainId, safeAddress } = validateInput<Input>(search, parsers);

  const safeDeployed = await isContract(safeAddress, chainId);
  if (safeDeployed) {
    return {
      meta: {
        message: `Safe Already Deployed: ${safeUrl(safeAddress, chainId)}`,
      },
    };
  }
  return {
    transaction: signRequestFor({
      chainId,
      metaTransactions: [NULL_TRANSACTION],
    }),
    meta: { safeUrl: safeUrl(safeAddress, chainId) },
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req, logic, (result) =>
    NextResponse.json(result, { status: 200 }),
  );
}
