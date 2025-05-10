import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SmartPassport } from "../target/types/smart_passport";
import { PublicKey } from "@solana/web3.js";

describe("smart-passport", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SmartPassport as Program<SmartPassport>;

  it("Initialize manufacturer list", async () => {
    const [manufacturerListPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer_list")],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        manufacturerList: manufacturerListPda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
    console.log("Manufacturer List:", manufacturerList);
  });

  it("Add a manufacturer", async () => {
    const [manufacturerListPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer_list")],
      program.programId
    );

    const manufacturer = anchor.web3.Keypair.generate().publicKey;

    await program.methods
      .addManufacturer(manufacturer)
      .accounts({
        manufacturerList: manufacturerListPda,
        admin: provider.wallet.publicKey,
      })
      .rpc();

    const manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
    console.log("Updated Manufacturer List:", manufacturerList);
  });

  it("Create a passport", async () => {
    const passport = anchor.web3.Keypair.generate();

    await program.methods
      .createPassport(
        "SN123",
        "2025-05-01",
        "DeviceX",
        "2 years",
        "USA",
        provider.wallet.publicKey.toString(),
        "QmCidExample",
        provider.wallet.publicKey
      )
      .accounts({
        passport: passport.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([passport])
      .rpc();

    const passportAccount = await program.account.passport.fetch(passport.publicKey);
    console.log("Passport:", passportAccount);
  });
});