import { useState, useEffect } from 'react';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { FaWallet, FaHome, FaPassport, FaQrcode, FaInfoCircle, FaTwitter, FaImage, FaUserShield, FaIndustry, FaUser } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import PassportsPage from './components/PassportsPage';
import ScanPage from './components/ScanPage';
import CreateNFTPage from './components/CreateNFTPage';
import LoadingSpinner from './components/LoadingSpinner';
import { motion } from 'framer-motion';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from './assets/SPP_logo.png';
import { requestAirdrop } from './utils/airdrop';
import FAQ from './components/FAQ';

const Navigation = ({ walletAddress, role, connectWallet, disconnectWallet, addManufacturer }) => {
  const { t } = useTranslation();
  const [newManufacturerAddress, setNewManufacturerAddress] = useState('');
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  console.log('Navigation render - Role:', role);

  const handleAddManufacturer = async (e) => {
    e.preventDefault();
    if (!newManufacturerAddress || !newManufacturerName) return;
    await addManufacturer(newManufacturerAddress, newManufacturerName);
    setNewManufacturerAddress('');
    setNewManufacturerName('');
  };

  const handleRequestAirdrop = async () => {
    if (!walletAddress || isRequestingAirdrop) return;
    
    setIsRequestingAirdrop(true);
    try {
      const result = await requestAirdrop(walletAddress);
      if (result.success) {
        alert(`Airdrop successful!\nOld balance: ${result.oldBalance} SOL\nNew balance: ${result.newBalance} SOL`);
      } else {
        alert(`Airdrop failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error requesting airdrop: ${error.message}`);
    } finally {
      setIsRequestingAirdrop(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="w-3.5 h-3.5" />;
      case 'manufacturer':
        return <FaIndustry className="w-3.5 h-3.5" />;
      default:
        return <FaUser className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'manufacturer':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

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
            <Link to="/" className="text-white text-xl font-bold flex items-center gap-2 py-4">
              <img src={logo} alt="Smart Product Passport Logo" className="w-16" />
              {t('title')}
            </Link>
            {!walletAddress && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <FaHome className="mr-2" /> {t('main')}
                  </NavLink>
                  <NavLink to="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <FaInfoCircle className="mr-2" /> {t('about')}
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {walletAddress ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-white border border-gray-700/50 hover:bg-gray-700/50 transition-all"
                >
                  <FaWallet className="text-gray-400" />
                  <div className="text-gray-300 text-sm font-mono">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </div>
                  {role && (
                    <div className={`text-sm px-2 py-1 rounded-full flex items-center gap-1.5 border ${getRoleColor(role)}`}>
                      {getRoleIcon(role)}
                      <span className="capitalize">{role}</span>
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 py-2"
                  >
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                      <div className="text-white font-mono text-sm break-all bg-gray-700/30 p-2 rounded">
                        {walletAddress}
                      </div>
                    </div>

                    <div className="p-2 space-y-2">
                      {role === 'admin' && (
                        <form onSubmit={handleAddManufacturer} className="p-2 bg-gray-700/30 rounded-lg space-y-2">
                          <input
                            type="text"
                            value={newManufacturerAddress}
                            onChange={(e) => setNewManufacturerAddress(e.target.value)}
                            placeholder="Manufacturer address"
                            className="w-full bg-gray-800 text-white px-3 py-1 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newManufacturerName}
                            onChange={(e) => setNewManufacturerName(e.target.value)}
                            placeholder="Manufacturer name"
                            className="w-full bg-gray-800 text-white px-3 py-1 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all text-sm"
                          >
                            Add Manufacturer
                          </motion.button>
                        </form>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequestAirdrop}
                        disabled={isRequestingAirdrop}
                        className={`w-full px-3 py-2 rounded-lg ${
                          isRequestingAirdrop 
                            ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                        } border transition-all text-sm flex items-center justify-center gap-2`}
                      >
                        {isRequestingAirdrop ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Get SOL Airdrop
                          </>
                        )}
                      </motion.button>

                      <Link
                        to="/create-nft"
                        className="block w-full px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm text-center"
                      >
                        Create Product Passport
                      </Link>

                      <Link
                        to="/passports"
                        className="block w-full px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm text-center"
                      >
                        My Passports
                      </Link>

                      <Link
                        to="/scan"
                        className="block w-full px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm text-center"
                      >
                        Scan Passport
                      </Link>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={disconnectWallet}
                        className="w-full px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
                      >
                        {t('disconnect')}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
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
        <FAQ />
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
          href="https://x.com/SmartProductID"
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
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID || '8tdpknetCPXv5Ztk8yoJWceRCgCxp3T6U56TnUGk99t4');
  const ADMIN_PUBLIC_KEY = new PublicKey('79p8ggDFPaYshTZaGsXLkJNdrphD3QrQsRv6hhdwAfFD');

  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (window.solana && window.solana.isPhantom) {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
          await fetchPassports();
        }
      } catch (error) {
        console.log('Wallet not connected');
      } finally {
        setIsLoading(false);
      }
    };

    checkWallet();
  }, []);

  const initializeManufacturerList = async () => {
    try {
      if (!walletAddress) {
        setStatus('Please connect your wallet first');
        return;
      }

      if (role !== 'admin') {
        setStatus('Only admin can initialize manufacturer list');
        return;
      }

      const program = await initializeProgram();
      if (!program) {
        throw new Error('Failed to initialize program');
      }

      const [manufacturerListPda] = PublicKey.findProgramAddressSync([
        Buffer.from('manufacturer_list')
      ], PROGRAM_ID);

      // Перевіряємо чи акаунт вже ініціалізований
      try {
        await program.account.manufacturerList.fetch(manufacturerListPda);
        console.log('Manufacturer list already initialized');
        return;
      } catch (err) {
        if (!err.message.includes('Account does not exist')) {
          throw err;
        }
      }

      const tx = await program.methods
        .initialize()
        .accounts({
          manufacturerList: manufacturerListPda,
          admin: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Initialize transaction:', tx);
      setStatus('Manufacturer list initialized successfully!');
    } catch (error) {
      console.error('Error initializing manufacturer list:', error);
      setStatus(`Error initializing manufacturer list: ${error.message}`);
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
      console.log('Connected wallet:', publicKey);

      const program = await initializeProgram();
      if (!program) return;

      const [manufacturerListPda] = PublicKey.findProgramAddressSync([
        Buffer.from('manufacturer_list')
      ], PROGRAM_ID);

      let manufacturerList;
      try {
        manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
        console.log('Manufacturer list:', manufacturerList);
      } catch (err) {
        console.log('Error fetching manufacturer list:', err);
        manufacturerList = null;
      }

      const manufacturers = (manufacturerList?.manufacturers || []).map((pk) => pk.toString());
      console.log('Manufacturers:', manufacturers);
      console.log('Admin key:', ADMIN_PUBLIC_KEY.toString());

      if (publicKey === ADMIN_PUBLIC_KEY.toString()) {
        console.log('Setting role: admin');
        setRole('admin');
        // Автоматично ініціалізуємо список виробників, якщо адмін підключився
        await initializeManufacturerList();
      } else if (manufacturers.includes(publicKey)) {
        console.log('Setting role: manufacturer');
        setRole('manufacturer');
      } else {
        console.log('Setting role: user');
        setRole('user');
      }

      setStatus('Wallet connected!');
      await fetchPassports();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setStatus(`Error connecting wallet: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mintPassport = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (!walletAddress) {
        setStatus('Please connect your wallet first');
        return;
      }

      const program = await initializeProgram();
      if (!program) {
        throw new Error('Failed to initialize program. Please check if the program is deployed.');
      }

      // Перевіряємо чи програма розгорнута
      const programInfo = await connection.getAccountInfo(PROGRAM_ID);
      if (!programInfo) {
        throw new Error('Program not found on chain. Please make sure the program is deployed to devnet.');
      }

      // Перевіряємо чи користувач має права на створення паспорта
      if (role !== 'manufacturer' && role !== 'admin') {
        throw new Error('Only manufacturers and admins can create passports');
      }

      const [passportPda] = PublicKey.findProgramAddressSync([
        Buffer.from('passport'),
        Buffer.from(formData.serialNumber),
      ], PROGRAM_ID);

      // Перевіряємо чи паспорт вже існує
      try {
        const existingPassport = await program.account.passport.fetch(passportPda);
        if (existingPassport) {
          throw new Error('Passport with this serial number already exists');
        }
      } catch (err) {
        // Якщо помилка не про відсутність акаунта, прокидаємо її далі
        if (!err.message.includes('Account does not exist')) {
          throw err;
        }
      }

      const tx = await program.methods
        .createPassport(
          formData.serialNumber,
          formData.productionDate,
          formData.deviceModel,
          formData.warrantyPeriod,
          formData.countryOfOrigin,
          formData.manufacturerId || walletAddress,
          '',
          new PublicKey(walletAddress)
        )
        .accounts({
          passport: passportPda,
          manufacturer: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      setStatus('Passport created successfully!');
      
      // Очищаємо форму
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

      // Оновлюємо список паспортів
      await fetchPassports();

      // Перенаправляємо на сторінку паспортів
      window.location.href = '/passports';
    } catch (error) {
      console.error('Error creating passport:', error);
      let errorMessage = error.message;
      
      // Додаткова обробка помилок Anchor
      if (error.logs) {
        console.error('Program logs:', error.logs);
        errorMessage += `\nProgram logs: ${error.logs.join('\n')}`;
      }
      
      setStatus(`Error creating passport: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
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
      console.error('Error fetching passports:', error);
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
      console.error('Error scanning QR:', error);
      setStatus(`Error scanning QR: ${error.message}`);
    }
  };

  const initializeProgram = async () => {
    try {
      if (!connection || !window.solana) {
        throw new Error('Connection or wallet not initialized');
      }
      const provider = new AnchorProvider(connection, window.solana, {
        preflightCommitment: 'confirmed',
      });

      // Спочатку спробуємо отримати IDL з мережі
      try {
        const idl = await Program.fetchIdl(PROGRAM_ID, provider);
        if (idl) {
          console.log('Successfully fetched IDL from network');
          return new Program(idl, PROGRAM_ID, provider);
        }
      } catch (err) {
        console.log('Could not fetch IDL from network, using local version');
      }

      // Якщо не вдалося отримати IDL з мережі, використовуємо локальну версію
      const idl = {
        version: '0.1.0',
        name: 'smart_passport',
        instructions: [
          {
            name: 'initialize',
            accounts: [
              { 
                name: 'manufacturerList', 
                isMut: true, 
                isSigner: false,
                docs: 'The manufacturer list account'
              },
              { 
                name: 'admin', 
                isMut: true, 
                isSigner: true,
                docs: 'The admin account'
              },
              { 
                name: 'systemProgram', 
                isMut: false, 
                isSigner: false,
                docs: 'The system program'
              }
            ],
            args: []
          },
          {
            name: 'addManufacturer',
            accounts: [
              { 
                name: 'manufacturerList', 
                isMut: true, 
                isSigner: false,
                docs: 'The manufacturer list account'
              },
              { 
                name: 'admin', 
                isMut: false, 
                isSigner: true,
                docs: 'The admin account'
              }
            ],
            args: [
              { 
                name: 'manufacturer', 
                type: 'publicKey',
                docs: 'The manufacturer public key'
              },
              { 
                name: 'name', 
                type: 'string',
                docs: 'The manufacturer name'
              }
            ]
          },
          {
            name: 'createPassport',
            accounts: [
              { 
                name: 'passport', 
                isMut: true, 
                isSigner: false,
                docs: 'The passport account'
              },
              { 
                name: 'manufacturer', 
                isMut: true, 
                isSigner: true,
                docs: 'The manufacturer account'
              },
              { 
                name: 'systemProgram', 
                isMut: false, 
                isSigner: false,
                docs: 'The system program'
              }
            ],
            args: [
              { 
                name: 'serialNumber', 
                type: 'string',
                docs: 'The passport serial number'
              },
              { 
                name: 'productionDate', 
                type: 'string',
                docs: 'The production date'
              },
              { 
                name: 'deviceModel', 
                type: 'string',
                docs: 'The device model'
              },
              { 
                name: 'warrantyPeriod', 
                type: 'string',
                docs: 'The warranty period'
              },
              { 
                name: 'countryOfOrigin', 
                type: 'string',
                docs: 'The country of origin'
              },
              { 
                name: 'manufacturerId', 
                type: 'string',
                docs: 'The manufacturer ID'
              },
              { 
                name: 'ipfsCid', 
                type: 'string',
                docs: 'The IPFS CID'
              },
              { 
                name: 'owner', 
                type: 'publicKey',
                docs: 'The owner account'
              }
            ]
          }
        ],
        accounts: [
          {
            name: 'ManufacturerList',
            docs: 'The manufacturer list account',
            type: {
              kind: 'struct',
              fields: [
                { 
                  name: 'manufacturers', 
                  docs: 'The list of manufacturers',
                  type: { 
                    vec: {
                      kind: 'struct',
                      fields: [
                        { 
                          name: 'name', 
                          docs: 'The manufacturer name',
                          type: 'string' 
                        },
                        { 
                          name: 'pubkey', 
                          docs: 'The manufacturer public key',
                          type: 'publicKey' 
                        }
                      ]
                    }
                  } 
                }
              ]
            }
          },
          {
            name: 'Passport',
            docs: 'The passport account',
            type: {
              kind: 'struct',
              fields: [
                { 
                  name: 'serialNumber', 
                  docs: 'The passport serial number',
                  type: 'string' 
                },
                { 
                  name: 'productionDate', 
                  docs: 'The production date',
                  type: 'string' 
                },
                { 
                  name: 'deviceModel', 
                  docs: 'The device model',
                  type: 'string' 
                },
                { 
                  name: 'warrantyPeriod', 
                  docs: 'The warranty period',
                  type: 'string' 
                },
                { 
                  name: 'countryOfOrigin', 
                  docs: 'The country of origin',
                  type: 'string' 
                },
                { 
                  name: 'manufacturerId', 
                  docs: 'The manufacturer ID',
                  type: 'string' 
                },
                { 
                  name: 'ipfsCid', 
                  docs: 'The IPFS CID',
                  type: 'string' 
                },
                { 
                  name: 'owner', 
                  docs: 'The owner account',
                  type: 'publicKey' 
                }
              ]
            }
          }
        ],
        errors: [
          {
            code: 6000,
            name: 'ManufacturerAlreadyExists',
            msg: 'Manufacturer already exists in the list'
          }
        ]
      };

      console.log('Using local IDL version');
      return new Program(idl, PROGRAM_ID, provider);
    } catch (error) {
      console.error('Error initializing program:', error);
      setStatus(`Error initializing program: ${error.message}`);
      return null;
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress(null);
        setRole(null);
        setPassports([]);
        setStatus('Wallet disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setStatus(`Error disconnecting wallet: ${error.message}`);
    }
  };

  const addManufacturer = async (manufacturerAddress, manufacturerName) => {
    try {
      if (!walletAddress) {
        setStatus('Please connect your wallet first');
        return;
      }

      if (role !== 'admin') {
        setStatus('Only admin can add manufacturers');
        return;
      }

      const program = await initializeProgram();
      if (!program) {
        throw new Error('Failed to initialize program');
      }

      const [manufacturerListPda] = PublicKey.findProgramAddressSync([
        Buffer.from('manufacturer_list')
      ], PROGRAM_ID);

      // Перевіряємо чи список виробників ініціалізований
      try {
        await program.account.manufacturerList.fetch(manufacturerListPda);
      } catch (err) {
        if (err.message.includes('Account does not exist')) {
          // Якщо не ініціалізований, спробуємо ініціалізувати
          await initializeManufacturerList();
        } else {
          throw err;
        }
      }

      const manufacturerPubkey = new PublicKey(manufacturerAddress);

      const tx = await program.methods
        .addManufacturer(manufacturerPubkey, manufacturerName)
        .accounts({
          manufacturerList: manufacturerListPda,
          admin: new PublicKey(walletAddress),
        })
        .rpc();

      console.log('Add manufacturer transaction:', tx);
      setStatus('Manufacturer added successfully!');
      
      // Оновлюємо список виробників
      const manufacturerList = await program.account.manufacturerList.fetch(manufacturerListPda);
      console.log('Updated manufacturer list:', manufacturerList);
    } catch (error) {
      console.error('Error adding manufacturer:', error);
      setStatus(`Error adding manufacturer: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing application..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
        <Navigation 
          walletAddress={walletAddress} 
          role={role} 
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          addManufacturer={addManufacturer}
        />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/create-nft" 
              element={
                walletAddress ? (
                  <CreateNFTPage
                    mintPassport={mintPassport}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange}
                    formData={formData}
                    file={file}
                    status={status}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
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
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" text="Creating passport..." />
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;