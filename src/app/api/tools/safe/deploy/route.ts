import { type NextRequest, NextResponse } from "next/server";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "../../validate";
import { signRequestFor } from "../../util";
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
    const message = e instanceof Error ? e.message : String(e);
    console.error("ERROR MESSAGE", message);
    if (
      e instanceof Error &&
      "body" in e &&
      e.body instanceof Object &&
      "errorType" in e.body &&
      "description" in e.body
    ) {
      const errorMessage = `${e.body.errorType}: ${e.body.description}`;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
