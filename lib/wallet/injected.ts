"use client";

export async function connectInjectedWallet(): Promise<`0x${string}`> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found. Please install MetaMask or a compatible wallet.");
  }
  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from wallet.");
  }
  return accounts[0] as `0x${string}`;
}

export async function switchToStudionet(): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) return;
  const chainIdDecimal = parseInt(
    process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? "61999",
    10
  );
  const chainIdHex = "0x" + chainIdDecimal.toString(16);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: "GenLayer Studionet",
            rpcUrls: [
              process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api",
            ],
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          },
        ],
      });
    }
  }
}
