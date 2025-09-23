import { Address } from "viem";
import { isContract } from "near-safe";
import { safeUrl } from "../util";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "@bitte-ai/agent-sdk";
import type { MetaTransaction, SignRequest } from "@bitte-ai/agent-sdk/evm";
import { Router, Request, Response } from "express";

const NullTransaction: MetaTransaction = {
  to: "0x0000000000000000000000000000000000000000",
  value: "0x00",
  data: "0x",
};

interface Input {
  chainId: number;
  safeAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  safeAddress: addressField,
};

async function logic(
  search: URLSearchParams,
): Promise<{ transaction?: SignRequest; meta: Record<string, string> }> {
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
    transaction: {
      method: "eth_sendTransaction",
      chainId,
      params: [NullTransaction],
    },
    meta: { safeUrl: safeUrl(safeAddress, chainId) },
  };
}

const deployRouter = Router();

deployRouter.get("/", async (req: Request, res: Response) => {
  const result = await logic(new URLSearchParams(req.url));
  res.status(200).json(result);
});

export default deployRouter;
