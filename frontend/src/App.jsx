import React, { useState, useEffect } from 'react';

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

  const connection = new window.SolanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
  const PROGRAM_ID = new window.SolanaWeb3.PublicKey('YourProgramIdHere');
  const ADMIN_PUBLIC_KEY = 'AdminPubKeyHere';

  const initializeProgram = async () => {
    const provider = new window.Anchor.AnchorProvider(connection, window.solana, {
      preflightCommitment: 'confirmed',
    });

    const idl = {
      "version": "0.1.0",
      "name": "smart_passport",
      "instructions": [
        {
          "name": "initialize",
          "accounts": [
            { "name": "manufacturerList", "isMut": true, "isSigner": false },
            { "name": "admin", "isMut": true, "isSigner": true },
            { "name": "systemProgram", "isMut": false, "isSigner": false }
          ],
          "args": []
        },
        {
          "name": "addManufacturer",
          "accounts": [
            { "name": "manufacturerList", "isMut": true, "isSigner": false },
            { "name": "admin", "isMut": false, "isSigner": true }
          ],
          "args": [
            { "name": "manufacturer", "type": "publicKey" }
          ]
        },
        {
          "name": "createPassport",
          "accounts": [
            { "name": "passport", "isMut": true, "isSigner": false },
            { "name": "user", "isMut": true, "isSigner": true },
            { "name": "systemProgram", "isMut": false, "isSigner": false }
          ],
          "args": [
            { "name": "serialNumber", "type": "string" },
            { "name": "productionDate", "type": "string" },
            { "name": "deviceModel", "type": "string" },
            { "name": "warrantyPeriod", "type": "string" },
            { "name": "countryOfOrigin", "type": "string" },
            { "name": "manufacturerId", "type": "string" },
            { "name": "ipfsCid", "type": "string" },
            { "name": "owner", "type": "publicKey" }
          ]
        }
      ],
      "accounts": [
        {
          "name": "ManufacturerList",
          "type": {
            "kind": "struct",
            "fields": [
              { "name": "manufacturers", "type": { "vec": "publicKey" } }
            ]
          }
        },
        {
          "name": "Passport",
          "type": {
            "kind": "struct",
            "fields": [
              { "name": "serialNumber", "type": "string" },
              { "name": "productionDate", "type": "string" },
              { "name": "deviceModel", "type": "string" },
              { "name": "warrantyPeriod", "type": "string" },
              { "name": "countryOfOrigin", "type": "string" },
              { "name": "manufacturerId", "type": "string" },
              { "name": "ipfsCid", "type": "string" },
              { "name": "owner", "type": "publicKey" }
            ]
          }
        }
      ]
    };

    return new window.Anchor.Program(idl, PROGRAM_ID, provider);
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        const publicKey = response.publicKey.toString();
        setWalletAddress(publicKey);

        const program = await initializeProgram();
        const [manufacturerListPda] = window.SolanaWeb3.PublicKey.findProgramAddressSync(
          [Buffer.from("manufacturer_list")],
          PROGRAM_ID
        );
        const manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
        const manufacturers = manufacturerList.manufacturers.map(pk => pk.toString());

        if (publicKey === ADMIN_PUBLIC_KEY) {
          setRole('admin');
        } else if (manufacturers.includes(publicKey)) {
          setRole('manufacturer');
        } else {
          setRole('user');
        }
        setStatus('Wallet connected!');
        fetchPassports();
      } else {
        setStatus('Please install Phantom wallet.');
      }
    } catch (error) {
      setStatus('Error connecting wallet: ' + error.message);
    }
  };

  const fetchPassports = async () => {
    if (!walletAddress) return;

    try {
      const program = await initializeProgram();
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: PROGRAM_ID.toBase58().slice(0, 32),
            },
          },
        ],
      });
      const fetchedPassports = [];

      for (const account of accounts) {
        try {
          const passport = await program.account.passport.fetch(account.pubkey);
          if (passport && (role === 'user' && passport.owner.toString() === walletAddress) ||
              (role === 'manufacturer' && passport.manufacturerId === walletAddress)) {
            fetchedPassports.push({ ...passport, address: account.pubkey.toString() });
          }
        } catch (error) {
          console.error('Error fetching passport:', error);
        }
      }

      setPassports(fetchedPassports);
    } catch (error) {
      setStatus('Error fetching passports: ' + error.message);
    }
  };

  const addManufacturer = async (e) => {
    e.preventDefault();
    if (role !== 'admin') {
      setStatus('Only admin can add manufacturers.');
      return;
    }

    try {
      const program = await initializeProgram();
      const [manufacturerListPda] = window.SolanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from("manufacturer_list")],
        PROGRAM_ID
      );

      await program.rpc.addManufacturer(new window.SolanaWeb3.PublicKey(manufacturerAddress), {
        accounts: {
          manufacturerList: manufacturerListPda,
          admin: new window.SolanaWeb3.PublicKey(walletAddress),
        },
      });

      setStatus('Manufacturer added successfully!');
      setManufacturerAddress('');
    } catch (error) {
      setStatus('Error adding manufacturer: ' + error.message);
    }
  };

  const uploadToIpfs = async (file) => {
    try {
      const ipfs = window.IpfsHttpClient.create({ url: 'https://ipfs.infura.io:5001' });
      const added = await ipfs.add(file);
      return added.path;
    } catch (error) {
      setStatus('Error uploading to IPFS: ' + error.message);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const ipfsCid = await uploadToIpfs(uploadedFile);
      if (ipfsCid) {
        setFormData({ ...formData, ipfsCid });
        setStatus(`File uploaded to IPFS with CID: ${ipfsCid}`);
      }
    }
  };

  const generateQrCode = () => {
    if (role !== 'manufacturer') {
      setStatus('Only manufacturers can generate QR codes.');
      return;
    }
    const qrData = `${formData.serialNumber}-${Date.now()}`;
    setQrCodeData(qrData);
    new window.QRCode(document.getElementById('qrcode'), {
      text: qrData,
      width: 128,
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
    });
    setStatus('QR code generated. Print and attach to product.');
  };

  const mintPassport = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setStatus('Please connect your wallet first.');
      return;
    }
    if (!qrCodeData || !formData.serialNumber.includes(qrCodeData.split('-')[0])) {
      setStatus('Please scan a valid QR code first.');
      return;
    }

    try {
      setStatus('Minting NFT Passport...');
      const program = await initializeProgram();
      const passportAccount = window.SolanaWeb3.Keypair.generate();

      await program.rpc.createPassport(
        formData.serialNumber,
        formData.productionDate,
        formData.deviceModel,
        formData.warrantyPeriod,
        formData.countryOfOrigin,
        formData.manufacturerId,
        formData.ipfsCid,
        new window.SolanaWeb3.PublicKey(walletAddress),
        {
          accounts: {
            passport: passportAccount.publicKey,
            user: new window.SolanaWeb3.PublicKey(walletAddress),
            systemProgram: window.SolanaWeb3.SystemProgram.programId,
          },
          signers: [passportAccount],
        }
      );

      setStatus(`NFT Passport minted! Address: ${passportAccount.publicKey.toString()}`);
      setPassports([...passports, { ...formData, address: passportAccount.publicKey.toString(), owner: walletAddress }]);
      setQrCodeData(null);
      fetchPassports();
    } catch (error) {
      setStatus('Error minting NFT: ' + error.message);
    }
  };

  const handleQrScan = (e) => {
    const qrData = prompt('Scan QR Code and enter the data:');
    if (qrData && formData.serialNumber === qrData.split('-')[0]) {
      setQrCodeData(qrData);
      setStatus('QR code scanned successfully!');
    } else {
      setStatus('Invalid QR code or serial number mismatch.');
    }
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);

    const sortedPassports = [...passports].sort((a, b) => {
      const valueA = a[field]?.toString().toLowerCase() || '';
      const valueB = b[field]?.toString().toLowerCase() || '';
      if (newOrder === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    setPassports(sortedPassports);
  };

  useEffect(() => {
    if (walletAddress) {
      fetchPassports();
    }
  }, [walletAddress, role]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Smart Product Passport</h1>

      <div className="text-center mb-6">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="text-green-400">
            Connected: {walletAddress} | Role: {role}
          </p>
        )}
      </div>

      {role === 'admin' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
          <form onSubmit={addManufacturer}>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Manufacturer Public Key"
                value={manufacturerAddress}
                onChange={(e) => setManufacturerAddress(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Add Manufacturer
            </button>
          </form>
        </div>
      )}

      {role === 'manufacturer' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Manufacturer Panel</h2>
          <form onSubmit={(e) => { e.preventDefault(); generateQrCode(); }}>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="serialNumber"
                placeholder="Serial Number"
                value={formData.serialNumber}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="productionDate"
                placeholder="Production Date (e.g., 2025-05-01)"
                value={formData.productionDate}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="deviceModel"
                placeholder="Device Model"
                value={formData.deviceModel}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="warrantyPeriod"
                placeholder="Warranty Period (e.g., 2 years)"
                value={formData.warrantyPeriod}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="countryOfOrigin"
                placeholder="Country of Origin"
                value={formData.countryOfOrigin}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="manufacturerId"
                placeholder="Manufacturer ID"
                value={formData.manufacturerId}
                onChange={handleInputChange}
                className="p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="file"
                onChange={handleFileChange}
                className="p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Generate QR Code
            </button>
          </form>
          {qrCodeData && (
            <div className="mt-4 text-center">
              <div id="qrcode"></div>
              <p className="text-sm">Print this QR code and attach it to the product.</p>
            </div>
          )}
        </div>
      )}

      {role === 'user' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">User Panel</h2>
          <button
            onClick={handleQrScan}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Scan QR Code
          </button>
          <form onSubmit={mintPassport} className="mt-4">
            <button
              type="submit"
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={!qrCodeData}
            >
              Mint NFT Passport
            </button>
          </form>
        </div>
      )}

      {status && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
          <p className={status.includes('Error') ? 'text-red-400' : 'text-green-400'}>{status}</p>
        </div>
      )}

      {passports.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">{role === 'user' ? 'Your Passports' : 'Manufactured Passports'}</h2>
          <div className="mb-4">
            <label className="mr-2">Sort by:</label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white"
            >
              <option value="serialNumber">Serial Number</option>
              <option value="productionDate">Production Date</option>
              <option value="deviceModel">Device Model</option>
            </select>
          </div>
          <div className="space-y-4">
            {passports.map((passport, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Address:</strong> {passport.address}</p>
                <p><strong>Serial Number:</strong> {passport.serialNumber}</p>
                <p><strong>Production Date:</strong> {passport.productionDate}</p>
                <p><strong>Device Model:</strong> {passport.deviceModel}</p>
                <p><strong>Warranty Period:</strong> {passport.warrantyPeriod}</p>
                <p><strong>Country of Origin:</strong> {passport.countryOfOrigin}</p>
                <p><strong>Manufacturer ID:</strong> {passport.manufacturerId}</p>
                <p><strong>IPFS CID:</strong> <a href={`https://ipfs.io/ipfs/${passport.ipfsCid}`} target="_blank" className="text-blue-400">{passport.ipfsCid}</a></p>
                {role === 'user' && <p><strong>Owner:</strong> {passport.owner.toString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;