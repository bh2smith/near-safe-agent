import { NextRequest, NextResponse } from "next/server";
import { validateRequest as innerValidate } from "@bitte-ai/agent-sdk";

export async function validateRequest(
  req: NextRequest,
): Promise<NextResponse | null> {
  return innerValidate<NextRequest, NextResponse>(
    req,
    (data: unknown, init?: { status?: number }) =>
      NextResponse.json(data, init),
  );
}
