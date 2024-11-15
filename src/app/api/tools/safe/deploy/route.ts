import { type NextRequest, NextResponse } from "next/server";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "../../validate";
import { signRequestFor, validateRequest } from "../../util";
import { Address, zeroAddress } from "viem";
import { isContract } from "near-safe";
import { safeUrl } from "../util";

interface Input {
  chainId: number;
  safeAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  safeAddress: addressField,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const headerError = await validateRequest(req);
  if (headerError) return headerError;

  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  try {
    const { chainId, safeAddress } = validateInput<Input>(search, parsers);

    const safeDeployed = await isContract(safeAddress, chainId);
    if (safeDeployed) {
      return NextResponse.json(
        {
          transaction: null,
          meta: {
            message:
              "Safe Already Deployed. See here: " +
              safeUrl(safeAddress, chainId),
          },
        },
        { status: 200 },
      );
    }
    const transaction = signRequestFor({
      chainId,
      metaTransactions: [
        {
          to: zeroAddress,
          value: "0x00",
          data: "0x",
        },
      ],
    });
    return NextResponse.json(
      { transaction, meta: { safeUrl: safeUrl(safeAddress, chainId) } },
      { status: 200 },
    );
  } catch (e: unknown) {
    const message = JSON.stringify(e);
    console.error(message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
