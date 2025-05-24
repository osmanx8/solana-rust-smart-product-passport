import { useState, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { create } from 'ipfs-http-client';
import QRCode from 'qrcode';
import { Buffer } from 'buffer';
import { FaWallet, FaHome, FaPassport, FaQrcode, FaInfoCircle, FaTwitter } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import PassportsPage from './components/PassportsPage';
import ScanPage from './components/ScanPage';
import { motion } from 'framer-motion';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from './assets/logo.png';

window.Buffer = Buffer;

const Navigation = ({ walletAddress, role, connectWallet }) => {
  const { t } = useTranslation();
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 fixed w-full top-0 z-50 border-b border-gray-800 shadow-lg"
      style={{ boxShadow: '0 2px 16px 0 rgba(16,16,32,0.25)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 pb-2">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white text-xl font-bold flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-8 h-8" />
              {t('title')}
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <NavLink to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <FaHome className="mr-2" /> {t('main')}
                </NavLink>
                {walletAddress && (
                  <>
                    <NavLink to="/passports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                      <FaPassport className="mr-2" /> {t('passports')}
                    </NavLink>
                    <NavLink to="/scan" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                      <FaQrcode className="mr-2" /> {t('scan')}
                    </NavLink>
                  </>
                )}
                <NavLink to="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <FaInfoCircle className="mr-2" /> {t('about')}
                </NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {walletAddress ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <div className="text-gray-300 text-sm bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </div>
                <div className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {role}
                </div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                <FaWallet /> {t('connect_wallet')}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, children, ...props }) => {
  const isActive = window.location.pathname === to;
  return (
    <Link
      to={to}
      className={`${isActive ? 'text-white bg-gray-800/50' : ''} ${props.className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-2 drop-shadow-lg">
            Smart Product Passport
          </h1>
          <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
            {t('secure_storage_desc')}
          </p>
        </motion.div>
        {/* 3D Box with QR code block */}
        <motion.div
          id="scan3d"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center my-20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t('qr_codes')}</h2>
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* 3D box imitation */}
            <div className="absolute w-48 h-48 bg-gradient-to-br from-blue-800 to-purple-700 rounded-2xl shadow-2xl transform rotate-12 scale-110 blur-sm opacity-60" />
            <div className="relative w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center animate-pulse">
              {/* QR code placeholder */}
              <div className="bg-white p-2 rounded-lg shadow-lg mb-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=TestNFT" alt="Test NFT QR" className="w-28 h-28" />
              </div>
              <span className="text-white text-lg font-semibold">NFT QR</span>
            </div>
          </div>
          <p className="text-gray-400 mt-4 max-w-md">{t('qr_codes_desc')}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{t('secure_storage')}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t('secure_storage_desc')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v4m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{t('qr_codes')}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t('qr_codes_desc')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{t('authenticity_check')}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t('authenticity_check_desc')}
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">{t('how_it_works')}</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-blue-400 mb-2">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step1')}</h3>
              <p className="text-gray-400 text-sm">{t('step1')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-purple-400 mb-2">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step2')}</h3>
              <p className="text-gray-400 text-sm">{t('step2')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-green-400 mb-2">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step3')}</h3>
              <p className="text-gray-400 text-sm">{t('step3')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-yellow-400 mb-2">4</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step4')}</h3>
              <p className="text-gray-400 text-sm">{t('step4')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-8">Про нас</h1>
        <div className="bg-gray-800/50 p-8 rounded-xl">
          <p className="text-gray-300 mb-6">
            Smart Product Passport - це інноваційне рішення для створення та управління цифровими паспортами продуктів.
            Наша платформа використовує блокчейн Solana для забезпечення безпеки та прозорості даних.
          </p>
          <p className="text-gray-300 mb-6">
            Ми надаємо інструменти для виробників, дилерів та кінцевих користувачів, дозволяючи їм
            створювати, перевіряти та керувати цифровими паспортами продуктів.
          </p>
          <p className="text-gray-300">
            Наша місія - зробити процес відстеження та перевірки продуктів більш ефективним та безпечним.
          </p>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-6 border-t border-gray-800 text-center flex flex-col items-center gap-2 shadow-lg" style={{ boxShadow: '0 -2px 16px 0 rgba(16,16,32,0.25)' }}>
      <span className="text-sm">{t('footer_text')}</span>
      <div className="flex gap-4 justify-center mt-2">
        <a
          href="https://twitter.com/yourproject"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors text-xl"
        >
          <FaTwitter />
        </a>
      </div>
    </footer>
  );
};

const App = () => {
  const { t } = useTranslation();
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToIpfs = async (file) => {
    try {
      const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
      });
      const added = await client.add(file);
      return added.path;
    } catch (error) {
      setStatus(`Error uploading to IPFS: ${error.message}`);
      return null;
    }
  };

  const mintPassport = async (e) => {
    e.preventDefault();
    try {
      if (!walletAddress) {
        setStatus('Please connect your wallet first');
        return;
      }

      let ipfsCid = '';
      if (file) {
        ipfsCid = await uploadToIpfs(file);
        if (!ipfsCid) return;
      }

      const program = await initializeProgram();
      if (!program) return;

      const [passportPda] = PublicKey.findProgramAddressSync([
        Buffer.from('passport'),
        Buffer.from(formData.serialNumber),
      ], PROGRAM_ID);

      await program.methods
        .createPassport(
          formData.serialNumber,
          formData.productionDate,
          formData.deviceModel,
          formData.warrantyPeriod,
          formData.countryOfOrigin,
          formData.manufacturerId,
          ipfsCid,
          new PublicKey(walletAddress)
        )
        .accounts({
          passport: passportPda,
          user: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus('Passport created successfully!');
      setFormData({
        serialNumber: '',
        productionDate: '',
        deviceModel: '',
        warrantyPeriod: '',
        countryOfOrigin: '',
        manufacturerId: '',
        ipfsCid: '',
      });
      setFile(null);
      fetchPassports();
    } catch (error) {
      setStatus(`Error creating passport: ${error.message}`);
    }
  };

  const handleQrScan = async (data) => {
    try {
      const program = await initializeProgram();
      if (!program) return;

      const [passportPda] = PublicKey.findProgramAddressSync([
        Buffer.from('passport'),
        Buffer.from(data),
      ], PROGRAM_ID);

      const passport = await program.account.passport.fetch(passportPda);
      setQrCodeData(passport);
    } catch (error) {
      setStatus(`Error fetching passport: ${error.message}`);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchPassports();
    }
  }, [walletAddress]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
        <Navigation 
          walletAddress={walletAddress} 
          role={role} 
          connectWallet={connectWallet} 
        />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/passports" 
              element={
                walletAddress ? (
                  <PassportsPage
                    role={role}
                    passports={passports}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange}
                    mintPassport={mintPassport}
                    handleSort={handleSort}
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/scan" 
              element={
                walletAddress ? (
                  <ScanPage handleQrScan={handleQrScan} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </div>
        <Footer />
        {status && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
            {status}
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;