import { type NextRequest, NextResponse } from "next/server";
import { getSafeSaltNonce, validateRequest } from "../../util";
import { Address } from "viem";
import { eip3770Address, getSafeWalletInfo } from "../util";
import { isContract } from "near-safe/dist/esm/util";
import { SafeContractSuite } from "near-safe";
import {
  addressField,
  FieldParser,
  numberField,
  signRequestFor,
  validateInput,
} from "@bitteprotocol/agent-sdk";

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const headerError = await validateRequest(req, getSafeSaltNonce());
  if (headerError) return headerError;

  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  try {
    const { chainId, recoveryAddress, safeAddress } = validateInput<Input>(
      search,
      parsers,
    );

    const ownersView = `https://app.safe.global/settings/setup?safe=${eip3770Address(safeAddress, chainId)}`;
    const safeDeployed = await isContract(safeAddress, chainId);
    if (safeDeployed) {
      const safeInfo = await getSafeWalletInfo(safeAddress, chainId);
      if (safeInfo && safeInfo.owners.includes(recoveryAddress)) {
        return NextResponse.json(
          {
            transaction: null,
            meta: {
              message: `Recovery address ${recoveryAddress} already an owner of this Safe! View here: ${ownersView}`,
            },
            error: "Recovery address already in Safe",
          },
          { status: 200 },
        );
      }
    }

    const transaction = signRequestFor({
      chainId,
      metaTransactions: [
        {
          to: safeAddress,
          value: "0",
          data: new SafeContractSuite().addOwnerData(recoveryAddress),
        },
      ],
    });
    return NextResponse.json(
      { transaction, meta: { safeUrl: ownersView } },
      { status: 200 },
    );
  } catch (e: unknown) {
    const message = JSON.stringify(e);
    console.error(message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
