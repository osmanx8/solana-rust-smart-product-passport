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
  // For Solana devnet/mainnet, use 'solana' as token
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

const uploadData = async () => {
	const irys = await getIrys();
	const dataToUpload = "GM world.";
	try {
		const receipt = await irys.upload(dataToUpload);
		console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
	} catch (e) {
		console.log("Error uploading data ", e);
	}
};

export async function getBundlrInstance(wallet, network = 'devnet') {
  if (!wallet || !wallet.publicKey) throw new Error("Wallet not connected");
  const patchedWallet = patchPhantomWallet(wallet);
  let bundlrAddress, providerUrl;
  if (network === 'mainnet-beta') {
    bundlrAddress = "https://node1.bundlr.network";
    providerUrl = clusterApiUrl("mainnet-beta");
  } else {
    bundlrAddress = "https://devnet.bundlr.network";
    providerUrl = "https://api.devnet.solana.com";
  }
  const bundlr = new WebBundlr(
    bundlrAddress,
    "solana",
    patchedWallet,
    {
      providerUrl: providerUrl,
    }
  );
  await bundlr.ready();
  return bundlr;
}

export async function uploadMetadataToBundlr(wallet, metadata, network = 'devnet') {
  const bundlr = await getBundlrInstance(wallet, network);
  const price = await bundlr.getPrice(Buffer.byteLength(JSON.stringify(metadata)));
  const balance = await bundlr.getLoadedBalance();
  if (balance.lt(price)) {
    await bundlr.fund(price.minus(balance));
  }
  const tx = await bundlr.upload(JSON.stringify(metadata), {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });
  return `https://arweave.net/${tx.id}`;
}

// === Додаю функцію для devnet/mainnet ===
// Тепер і devnet, і mainnet використовують Bundlr, але з різними адресами
export async function uploadMetadataDevnetOrMainnet(wallet, metadata, network) {
  return await uploadMetadataToBundlr(wallet, metadata, network);
} 