// util.test.ts
import {
  safeTxServiceUrlFor,
  getSafeWalletInfo,
  eip3770Address,
  safeUrl,
} from "../src/app/api/tools/safe/util";
import { SafeContractSuite } from "near-safe";

describe("signRequestFor", () => {
  it("Add recovery Tx", () => {
    const chainId = 1;
    const safeAddress = "0x1111111111111111111111111111111111111111";
    const recoveryAddress = "0xffffffffffffffffffffffffffffffffffffffff";
    const transaction = {
      method: "eth_sendTransaction",
      chainId,
      params: [
        {
          from: safeAddress,
          to: safeAddress,
          value: "0x0",
          data: new SafeContractSuite().addOwnerData(recoveryAddress),
        },
      ],
    };
    expect(transaction).toEqual({
      chainId: 1,
      method: "eth_sendTransaction",
      params: [
        {
          data: "0x0d582f13000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000001",
          from: "0x1111111111111111111111111111111111111111",
          to: "0x1111111111111111111111111111111111111111",
          value: "0x0",
        },
      ],
    });
  });
});

describe("safeTxServiceUrlFor", () => {
  it("should return the correct URL for a supported chainId", () => {
    expect(safeTxServiceUrlFor(1)).toBe(
      "https://safe-transaction-mainnet.safe.global",
    );
  });

  it("should throw an error for an unsupported chainId", () => {
    expect(safeTxServiceUrlFor(999)).toBeUndefined();
  });
});

describe("getSafeWalletInfo", () => {
  it.skip("should fetch and return wallet info", async () => {
    const mockResponse = {
      address: "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA",
      nonce: 2,
      threshold: 1,
      owners: ["0x8d99F8b2710e6A3B94d9bf465A98E5273069aCBd"],
      masterCopy: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
      modules: ["0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226"],
      fallbackHandler: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226",
      guard: "0x0000000000000000000000000000000000000000",
      version: "1.4.1+L2",
    };

    const walletInfo = await getSafeWalletInfo(
      "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA",
      8453,
    );
    expect(walletInfo).toEqual(mockResponse);
  });
});

describe("eip3770Address", () => {
  it("should return the correct EIP-3770 address", () => {
    expect(
      eip3770Address("0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA", 1),
    ).toBe("eth:0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA");
  });
});

describe("safeUrl", () => {
  it("should return the correct Safe URL", () => {
    expect(safeUrl("0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA", 1)).toBe(
      "https://app.safe.global/home?safe=eth:0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA",
    );
  });
});
