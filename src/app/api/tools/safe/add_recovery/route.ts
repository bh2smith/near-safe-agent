import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "../../util";
import { Address } from "viem";
import { eip3770Address, getSafeWalletInfo } from "../util";
import { isContract } from "near-safe/dist/esm/util";
import { SafeContractSuite } from "near-safe";
import {
  addressField,
  FieldParser,
  handleRequest,
  numberField,
  signRequestFor,
  validateInput,
  TxData,
} from "@bitte-ai/agent-sdk";

interface Input {
  chainId: number;
  safeAddress: Address;
  recoveryAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  safeAddress: addressField,
  recoveryAddress: addressField,
};

async function logic(req: NextRequest): Promise<TxData> {
  const headerError = await validateRequest(req);
  if (headerError) throw headerError;

  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  const { chainId, recoveryAddress, safeAddress } = validateInput<Input>(
    search,
    parsers,
  );

  const ownersView = `https://app.safe.global/settings/setup?safe=${eip3770Address(safeAddress, chainId)}`;
  const safeDeployed = await isContract(safeAddress, chainId);
  if (safeDeployed) {
    const safeInfo = await getSafeWalletInfo(safeAddress, chainId);
    if (safeInfo && safeInfo.owners.includes(recoveryAddress)) {
      return {
        meta: {
          message: `Recovery address ${recoveryAddress} already an owner of this Safe! View here: ${ownersView}`,
        },
      };
    }
  }
  return {
    transaction: signRequestFor({
      chainId,
      metaTransactions: [
        {
          to: safeAddress,
          value: "0",
          data: new SafeContractSuite().addOwnerData(recoveryAddress),
        },
      ],
    }),
    meta: { safeUrl: ownersView },
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req, logic, (result) =>
    NextResponse.json(result, { status: 200 }),
  );
}
