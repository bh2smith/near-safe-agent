import { networks } from "@safe-global/safe-core-sdk-utils/dist/src/eip-3770/config";

const SAFE_NETWORKS: { [chainId: number]: string } = {
  1: "mainnet",
  10: "optimism",
  56: "binance",
  100: "gnosis-chain",
  137: "polygon",
  8453: "base",
  42161: "arbitrum",
  11155111: "sepolia",
  // Add more networks as needed
};

const SHORT_NAMES = networks.reduce<{ [key: number]: string }>(
  (map, network) => {
    map[network.chainId] = network.shortName;
    return map;
  },
  {},
);

export function safeTxServiceUrlFor(chainId: number): string {
  const network = SAFE_NETWORKS[chainId];
  if (!network) {
    throw new Error(`Unsupported Safe Transaction Service chainId=${chainId}`);
  }
  return `https://safe-transaction-${network}.safe.global`;
}

interface SafeWalletInfo {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  guard: string;
  version: string;
}

export async function getSafeWalletInfo(
  walletAddress: string,
  chainId: number,
): Promise<SafeWalletInfo> {
  const baseUrl = safeTxServiceUrlFor(chainId);
  const response = await fetch(`${baseUrl}/api/v1/safes/${walletAddress}/`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Safe wallet info: ${response.statusText}`);
  }

  return response.json();
}

export function eip3770Address(address: string, chainId: number): string {
  return `${SHORT_NAMES[chainId]}:${address}`;
}

export function safeUrl(address: string, chainId: number): string {
  return `https://app.safe.global/home?safe=${eip3770Address(address, chainId)}`;
}
