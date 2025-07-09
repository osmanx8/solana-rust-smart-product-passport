import { createUmi } from '@metaplex-foundation/umi';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { createGenericFile, KeypairSigner } from '@metaplex-foundation/umi';
import fs from 'fs/promises';
import path from 'path';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair } from '@solana/web3.js';

async function main() {
  // 1. Завантажте свій Solana keypair з файлу (наприклад, ~/.config/solana/id.json)
  const keypairPath = path.resolve(process.env.HOME || process.env.USERPROFILE || '.', '.config', 'solana', 'id.json');
  const keypairArray = JSON.parse(await fs.readFile(keypairPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairArray));
  const signer = fromWeb3JsKeypair(keypair);

  // 2. Створюємо umi instance з uploader та підписувачем
  const umi = createUmi('https://api.devnet.solana.com').use(irysUploader());
  umi.use({
    install(umi) {
      umi.identity = signer as KeypairSigner;
    }
  });

  // 3. Читаємо файл з диска
  const collectionImagePath = path.resolve(__dirname, 'collection.png');
  const buffer = await fs.readFile(collectionImagePath);
  const file = createGenericFile(buffer, 'collection.png', { contentType: 'image/png' });

  // 4. Upload image
  const [imageUri] = await umi.uploader.upload([file]);
  console.log('image uri:', imageUri);

  // 5. Upload metadata.json
  const metadata = {
    name: 'My Collection',
    symbol: 'MC',
    description: 'My Collection description',
    image: imageUri,
  };
  const [metadataUri] = await umi.uploader.uploadJson([metadata]);
  console.log('Collection offchain metadata URI:', metadataUri);
}

main().catch(console.error); 