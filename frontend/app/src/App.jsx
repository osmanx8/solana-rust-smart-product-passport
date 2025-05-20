import { useState, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { create } from 'ipfs-http-client';
import QRCode from 'qrcode';
import { Buffer } from 'buffer';
import { FaWallet } from 'react-icons/fa';

window.Buffer = Buffer;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    serialNumber: '',
    productionDate: '',
    deviceModel: '',
    warrantyPeriod: '',
    countryOfOrigin: '',
    manufacturerId: '',
    ipfsCid: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [passports, setPassports] = useState([]);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [sortField, setSortField] = useState('serialNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID || '8oxPShxgCJX5cZTRqtPpwAefVpTGjmhrMp69iEdLGduH');
  const ADMIN_PUBLIC_KEY = new PublicKey('79p8ggDFPaYshTZaGsXLkJNdrphD3QrQsRv6hhdwAfFD');

  const initializeProgram = async () => {
    try {
      if (!connection || !window.solana) {
        throw new Error('Connection or wallet not initialized');
      }
      const provider = new AnchorProvider(connection, window.solana, {
        preflightCommitment: 'confirmed',
      });
      const idl = {
        version: '0.1.0',
        name: 'smart_passport',
        instructions: [
          {
            name: 'initialize',
            accounts: [
              { name: 'manufacturerList', isMut: true, isSigner: false },
              { name: 'admin', isMut: true, isSigner: true },
              { name: 'systemProgram', isMut: false, isSigner: false },
            ],
            args: [],
          },
          {
            name: 'addManufacturer',
            accounts: [
              { name: 'manufacturerList', isMut: true, isSigner: false },
              { name: 'admin', isMut: false, isSigner: true },
            ],
            args: [{ name: 'manufacturer', type: 'publicKey' }],
          },
          {
            name: 'createPassport',
            accounts: [
              { name: 'passport', isMut: true, isSigner: false },
              { name: 'user', isMut: true, isSigner: true },
              { name: 'systemProgram', isMut: false, isSigner: false },
            ],
            args: [
              { name: 'serialNumber', type: 'string' },
              { name: 'productionDate', type: 'string' },
              { name: 'deviceModel', type: 'string' },
              { name: 'warrantyPeriod', type: 'string' },
              { name: 'countryOfOrigin', type: 'string' },
              { name: 'manufacturerId', type: 'string' },
              { name: 'ipfsCid', type: 'string' },
              { name: 'owner', type: 'publicKey' },
            ],
          },
        ],
        accounts: [
          {
            name: 'ManufacturerList',
            type: {
              kind: 'struct',
              fields: [{ name: 'manufacturers', type: { vec: 'publicKey' } }],
            },
          },
          {
            name: 'Passport',
            type: {
              kind: 'struct',
              fields: [
                { name: 'serialNumber', type: 'string' },
                { name: 'productionDate', type: 'string' },
                { name: 'deviceModel', type: 'string' },
                { name: 'warrantyPeriod', type: 'string' },
                { name: 'countryOfOrigin', type: 'string' },
                { name: 'manufacturerId', type: 'string' },
                { name: 'ipfsCid', type: 'string' },
                { name: 'owner', type: 'publicKey' },
              ],
            },
          },
        ],
      };
      return new Program(idl, PROGRAM_ID, provider);
    } catch (error) {
      setStatus(`Error initializing program: ${error.message}`);
      return null;
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (!solana || !solana.isPhantom) {
        setStatus('Please install Phantom wallet.');
        return;
      }
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();
      setWalletAddress(publicKey);
      const program = await initializeProgram();
      if (!program) return;
      const [manufacturerListPda] = PublicKey.findProgramAddressSync([
        Buffer.from('manufacturer_list')
      ], PROGRAM_ID);
      let manufacturerList;
      try {
        manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
      } catch {
        manufacturerList = null;
      }
      const manufacturers = (manufacturerList?.manufacturers || []).map((pk) => pk.toString());
      if (publicKey === ADMIN_PUBLIC_KEY.toString()) {
        setRole('admin');
      } else if (manufacturers.includes(publicKey)) {
        setRole('manufacturer');
      } else {
        setRole('user');
      }
      setStatus('Wallet connected!');
      fetchPassports();
    } catch (error) {
      setStatus(`Error connecting wallet: ${error.message}`);
    }
  };

  const initializeManufacturerList = async () => {
    try {
      const program = await initializeProgram();
      if (!program) return;
      const [manufacturerListPda] = PublicKey.findProgramAddressSync([
        Buffer.from('manufacturer_list')
      ], PROGRAM_ID);
      await program.methods
        .initialize()
        .accounts({
          manufacturerList: manufacturerListPda,
          admin: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setStatus('Initialized ManufacturerList account.');
      fetchPassports();
    } catch (error) {
      setStatus(`Error initializing ManufacturerList: ${error.message}`);
    }
  };

  const fetchPassports = async () => {
    if (!walletAddress) return;
    try {
      const program = await initializeProgram();
      if (!program) return;
      const accounts = await program.account.passport.all();
      const fetchedPassports = accounts
        .map((account) => ({
          ...account.account,
          address: account.publicKey.toString(),
        }))
        .filter((passport) =>
          role === 'user'
            ? passport.owner.toString() === walletAddress
            : role === 'manufacturer' && passport.manufacturerId === walletAddress
        );
      setPassports(fetchedPassports);
    } catch (error) {
      setStatus(`Error fetching passports: ${error.message}`);
    }
  };

  // ...addManufacturer, uploadToIpfs, handleInputChange, handleFileChange, generateQrCode, mintPassport, handleQrScan, handleSort, useEffect як раніше...

  // --- UI ---
  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="w-full max-w-lg mx-auto text-center p-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow">Smart Product Passport</h1>
          <p className="text-lg text-gray-300 mb-10">Додаток для створення, перевірки та зберігання цифрових паспортів продукту на Solana.</p>
          <button
            onClick={connectWallet}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-800/80 hover:bg-gray-700 text-white text-xl font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaWallet size={28} /> Підключити гаманець
          </button>
          {status && <div className="mt-6 text-red-400">{status}</div>}
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 to-gray-800 py-10 px-2">
      <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow">Smart Product Passport</h1>
      <div className="text-green-400 text-lg mb-8">Гаманець підключено: <span className="font-mono">{walletAddress}</span> | Роль: <span className="font-bold">{role}</span></div>
      {status && <div className="mb-4 text-center text-red-400">{status}</div>}
      {role === 'admin' && (
        <button
          onClick={initializeManufacturerList}
          className="mb-6 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow transition"
        >
          Ініціалізувати контракт
        </button>
      )}
      {/* Далі функціонал згідно ролі: admin, manufacturer, user */}
      {/* ...сюди повертається функціонал додавання виробника, створення паспорта, перегляду паспортів, як було раніше, але без карток і з сучасним стилем... */}
    </div>
  );
};

export default App;