import { type NextRequest, NextResponse } from "next/server";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "../../validate";
import { extractAccountId, signRequestFor } from "../../util";
import { Address } from "viem";
// TODO(bh2smith): explicit export from near-safe
import { SafeContractSuite } from "near-safe/dist/esm/lib/safe";

interface Input {
  chainId: number;
  recoveryAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  recoveryAddress: addressField,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  try {
    const {safeAddress} = await extractAccountId(req);
    const { chainId, recoveryAddress } = validateInput<Input>(
      search,
      parsers,
    );
    const safePack = new SafeContractSuite();
    const result = signRequestFor({
      chainId,
      metaTransactions: [
        {
          to: safeAddress,
          value: "0",
          data: safePack.addOwnerData(recoveryAddress),
        },
      ],
    });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
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

    const message = e instanceof Error ? e.message : String(e);
    console.error(message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
