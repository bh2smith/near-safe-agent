import { type NextRequest, NextResponse } from "next/server";
import { FieldParser, numberField, validateInput } from "../../validate";
import { extractAccountId, signRequestFor } from "../../util";
import { zeroAddress } from "viem";
import { isContract } from "near-safe";

interface Input {
  chainId: number;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const search = req.nextUrl.searchParams;
  console.log("safe/deploy/", search);

  try {
    const { safeAddress } = await extractAccountId(req);
    const { chainId } = validateInput<Input>(search, parsers);
    // TODO(bh2smith): check if safe deployed.
    const safeDeployed = await isContract(safeAddress, chainId);
    if (safeDeployed) {
      return NextResponse.json(
        { transactions: [], meta: { message: "Safe Already Deployed" } },
        { status: 200 },
      );
    }
    const result = signRequestFor({
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
      { transaction: result, meta: { safeUrl: "TODO" } },
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
