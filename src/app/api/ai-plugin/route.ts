import { NextResponse } from "next/server";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const bitteConfig = JSON.parse(process.env.BITTE_CONFIG || "{}");
if (!key?.accountId) {
  console.error("no account");
}
if (!bitteConfig?.url) {
  console.error("no tunnel url");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "EVM Agent Boilerplate",
      description: "API for the boilerplate",
      version: "1.0.0",
    },
    servers: [
      {
        url: bitteConfig.url,
      },
    ],
    "x-mb": {
      "account-id": key.accountId,
      assistant: {
        name: "Safe Account Assistant",
        description: "An assistant for managing Near{Safe} Account Structure",
        instructions:
          "Encodes Safe account transactions as signature requests such as add recovery address and deployment. This assistant is only for EVM networks. Passes the transaction response to generate-evm-tx tool for signing and displays response meta containing Safe Interface URL to the user. It suggests to any user calling the deploy route to add_recovery instead and achive the same result.",
        tools: [{ type: "generate-evm-tx" }],
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["health"],
          summary: "Confirms server running",
          description: "Test Endpoint to confirm system is running",
          operationId: "check-health",
          parameters: [],
          responses: {
            "200": {
              description: "Ok Message",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "Ok Message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/safe/deploy": {
        get: {
          tags: ["deploy"],
          summary:
            "Encodes null transaction whose on-chain execution will trigger the Safe deployment on provided chainId.",
          description:
            "Encodes null transaction whose on-chain execution will trigger the Safe deployment on provided chainId.",
          operationId: "deploy",
          parameters: [{ $ref: "#/components/parameters/chainId" }],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
            "400": { $ref: "#/components/responses/BadRequest400" },
          },
        },
      },
      "/api/tools/safe/add_recovery": {
        get: {
          tags: ["recovery"],
          summary:
            "Encodes addOwnerWithThreshold transaction for the provided recoveryAddress",
          description:
            "Encodes Safe transaction to addOwnerWithThreshold as MetaTransaction",
          operationId: "add-recovery",
          parameters: [
            { $ref: "#/components/parameters/chainId" },
            { $ref: "#/components/parameters/from" },
            { $ref: "#/components/parameters/recoveryAddress" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
            "400": { $ref: "#/components/responses/BadRequest400" },
          },
        },
      },
    },
    components: {
      parameters: {
        from: {
          name: "from",
          in: "query",
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          required: true,
          schema: {
            type: "string",
          },
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        recoveryAddress: {
          name: "recoveryAddress",
          in: "query",
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          required: true,
          schema: {
            type: "string",
          },
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        chainId: {
          name: "chainId",
          in: "query",
          description: "Network on which to wrap the native asset",
          required: true,
          schema: {
            type: "number",
          },
          example: 1,
        },
      },
      responses: {
        SignRequestResponse200: {
          description:
            "Standard EVM Response containing SignRequest and additional Meta reference",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  transaction: {
                    $ref: "#/components/schemas/SignRequest",
                  },
                  meta: {
                    type: "object",
                    description:
                      "Additional metadata related to the transaction",
                    additionalProperties: true,
                    example: {
                      safeUrl:
                        "https://app.safe.global/home?safe=gno:0xbeEf4...",
                    },
                  },
                },
                required: ["transaction"],
              },
            },
          },
        },
        BadRequest400: {
          description: "Bad Request - Invalid or missing parameters",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Missing required parameters: chainId or amount",
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Address: {
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          type: "string",
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        SignRequest: {
          type: "object",
          required: ["method", "chainId", "params"],
          properties: {
            method: {
              type: "string",
              enum: [
                "eth_sign",
                "personal_sign",
                "eth_sendTransaction",
                "eth_signTypedData",
                "eth_signTypedData_v4",
              ],
              description: "The signing method to be used.",
              example: "eth_sendTransaction",
            },
            chainId: {
              type: "integer",
              description:
                "The ID of the Ethereum chain where the transaction or signing is taking place.",
              example: 1,
            },
            params: {
              oneOf: [
                {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MetaTransaction",
                  },
                  description: "An array of Ethereum transaction parameters.",
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for personal_sign request",
                  example: [
                    "0x4578616d706c65206d657373616765",
                    "0x0000000000000000000000000000000000000001",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for eth_sign request",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    "0x4578616d706c65206d657373616765",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Parameters for signing structured data (TypedDataParams)",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    '{"data": {"types": {"EIP712Domain": [{"name": "name","type": "string"}]}}}',
                  ],
                },
              ],
            },
          },
        },
        MetaTransaction: {
          description: "Sufficient data representing an EVM transaction",
          type: "object",
          properties: {
            to: {
              $ref: "#/components/schemas/Address",
              description: "Recipient address",
            },
            data: {
              type: "string",
              description: "Transaction calldata",
              example: "0xd0e30db0",
            },
            value: {
              type: "string",
              description: "Transaction value",
              example: "0x1b4fbd92b5f8000",
            },
          },
          required: ["to", "data", "value"],
        },
      },
    },
    "x-readme": {
      "explorer-enabled": true,
      "proxy-enabled": true,
    },
  };

  return NextResponse.json(pluginData);
}
