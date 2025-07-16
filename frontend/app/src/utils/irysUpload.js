import { clusterApiUrl, Connection } from "@solana/web3.js";
import Irys from "@irys/sdk";

// Polyfill sendTransaction for Phantom if missing
function patchPhantomWallet(wallet) {
  if (!wallet.sendTransaction) {
    wallet.sendTransaction = async (transaction, connection) => {
      const signedTx = await wallet.signTransaction(transaction);
      const rawTx = signedTx.serialize();
      const txid = await connection.sendRawTransaction(rawTx);
      await connection.confirmTransaction(txid, "finalized");
      await new Promise(res => setTimeout(res, 2000));
      return txid;
    };
  }
  return wallet;
}

// For Phantom wallet, we need to use the wallet provider, not a private key
const getIrys = async (wallet, network = "devnet") => {
  const url = network === "mainnet" ? "https://node1.irys.xyz" : "https://devnet.irys.xyz";
  const providerUrl = network === "mainnet" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com";
  const token = "solana";
  // Irys expects a wallet provider for Solana, not a private key
  const irys = new Irys({
    url,
    network,
    token,
    wallet,
    config: { providerUrl },
  });
  return irys;
};

export async function uploadMetadataToIrys(wallet, metadata, network = 'devnet') {
  const irys = await getIrys(wallet, network);
  const data = JSON.stringify(metadata);
  try {
    // Fund if needed (optional: check balance and fund as needed)
    // const price = await irys.getPrice(data.length);
    // const balance = await irys.getLoadedBalance();
    // if (balance.lt(price)) {
    //   await irys.fund(price.minus(balance));
    // }
    const receipt = await irys.upload(data, {
      tags: [{ name: "Content-Type", value: "application/json" }],
    });
    return `https://gateway.irys.xyz/${receipt.id}`;
  } catch (e) {
    console.error("Error uploading metadata to Irys:", e);
    throw e;
  }
}

// === Unified function for devnet/mainnet ===
export async function uploadMetadataDevnetOrMainnet(wallet, metadata, network) {
  return await uploadMetadataToIrys(wallet, metadata, network);
} 