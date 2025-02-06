import { NextResponse } from "next/server";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const bitteConfig = JSON.parse(process.env.BITTE_CONFIG || "{}");
if (!key?.accountId) {
  console.error("no account");
}

const url = bitteConfig.url || "https://near-safe-agent.vercel.app";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Bitte Safe Agent",
      description: "Agent API for Safe Account Management",
      version: "1.0.0",
    },
    servers: [{ url }],
    "x-mb": {
      "account-id": key.accountId,
      assistant: {
        name: "Safe Account Assistant",
        description: "An assistant for managing Near{Safe} Account Structure",
        instructions:
          "Encodes Safe account transactions as signature requests such as add recovery address and deployment. This assistant is only for EVM networks. Passes the transaction response to generate-evm-tx tool for signing and displays response meta containing Safe Interface URL to the user. Before deploy ask the user if they would also like to add a recovery address, if they do, call add recovery instead with the address they supply, otherwise proceed with deploy. Tells the user that they must sign the transaction before the url will display the results. Always passes evmAddress as the safeAddress.",
        tools: [{ type: "generate-evm-tx" }],
        categories: ["safe", "evm"],
        // All EIP155 Chains Supported by Safe: https://github.com/safe-global/safe-deployments/blob/main/src/assets/v1.3.0/gnosis_safe.json
        chainIds: [
          1, 10, 16, 18, 19, 25, 28, 43, 44, 46, 56, 57, 61, 63, 69, 81, 82, 83,
          100, 106, 108, 109, 111, 130, 137, 146, 148, 155, 179, 195, 196, 204,
          250, 252, 255, 288, 314, 336, 338, 360, 420, 480, 570, 588, 595, 599,
          648, 686, 690, 787, 919, 1001, 1088, 1101, 1111, 1112, 1135, 1230,
          1231, 1294, 1337, 1442, 1513, 1516, 1559, 1663, 1923, 1924, 2192,
          2221, 2222, 2358, 2810, 2818, 4157, 4653, 4689, 5000, 5001, 5003,
          5700, 6102, 6398, 7000, 7001, 7332, 7560, 7700, 8192, 8194, 8217,
          8453, 8822, 9000, 9001, 9728, 10000, 10001, 10081, 10242, 10243,
          11011, 13371, 13473, 14800, 17000, 17069, 17172, 23294, 23295, 25327,
          33139, 34443, 41455, 42161, 42220, 42793, 43111, 43113, 43114, 43288,
          48899, 48900, 54211, 56288, 57000, 57073, 59140, 59144, 60808, 71401,
          71402, 80085, 81457, 84531, 84532, 103454, 128123, 167000, 167009,
          314159, 490000, 534351, 534352, 534353, 656476, 713715, 763373,
          808813, 6038361, 7225878, 7777777, 11155111, 11155420, 94204209,
          111557560, 123420111, 245022926, 245022934, 666666666, 999999999,
          1313161554, 1666600000, 1666700000, 88153591557,
        ],
        image: `${url}/safe.svg`,
      },
      image: `${url}/safe.svg`,
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
          parameters: [
            { $ref: "#/components/parameters/chainId" },
            { $ref: "#/components/parameters/safeAddress" },
          ],
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
            "Encodes Safe transaction to addOwnerWithThreshold with recoveryAddress as the new owner, leaving the wallet signing threshold at 1.",
          operationId: "add-recovery",
          parameters: [
            { $ref: "#/components/parameters/chainId" },
            { $ref: "#/components/parameters/safeAddress" },
            {
              name: "recoveryAddress",
              in: "query",
              required: true,
              description: "Address to add as recovery",
              schema: {
                $ref: "#/components/schemas/Address",
              },
            },
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
        address: {
          name: "address", // This will be overridden by specific usages
          in: "query",
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          required: true,
          schema: {
            $ref: "#/components/schemas/Address",
          },
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        safeAddress: {
          name: "safeAddress",
          in: "query",
          required: true,
          description: "The Safe address (i.e. the connected user address)",
          schema: {
            $ref: "#/components/schemas/Address",
          },
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
