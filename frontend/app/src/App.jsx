import { useState, useEffect } from 'react';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import PassportsPage from './components/PassportsPage';
import ScanPage from './components/ScanPage';
import CreateNFTPage from './components/CreateNFTPage';
import LoadingSpinner from './components/LoadingSpinner';
import { motion } from 'framer-motion';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from './assets/SPP_logo.png';
import sppProtocol from './assets/comics/spp_protocol.png';
import solanaBreakpoint from './assets/comics/soana_breakout_hackathon_application.png';
import futureNftSpp from './assets/comics/future_nft_spp.png';
import updatingWithSpp from './assets/comics/updating_with_spp.png';
import skydiving from './assets/comics/skydiving.png';
import updateDrivers from './assets/comics/update_drivers.png';
import whiteLogo from './assets/SPP_logo_white.png';
import { requestAirdrop } from './utils/airdrop';
import FAQ from './components/FAQ';
import Community from './components/Community';
import ThreeDBoxSection from './components/ThreeDBoxSection';
import {
  HomeIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  UserIcon,
  PlusIcon,
  DocumentTextIcon,
  CameraIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  CircleStackIcon,
  GiftIcon,
  StarIcon,
  FlagIcon,
  RocketLaunchIcon,
  HandThumbUpIcon,
  UsersIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  BoltIcon,
  ArrowRightIcon,
  CogIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChevronDownIcon,
  QrCodeIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

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
        return <StarIcon className="w-4 h-4 text-yellow-400" />;
      case 'manufacturer':
        return <BuildingOfficeIcon className="w-4 h-4 text-blue-400" />;
      case 'dealer':
        return <ShoppingBagIcon className="w-4 h-4 text-green-400" />;
      case 'consumer':
        return <UserIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-400" />;
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
            {walletAddress && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    {t('main')}
                  </NavLink>
                  <NavLink to="/passports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    {t('passports')}
                  </NavLink>
                  <NavLink to="/scan" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <CameraIcon className="w-4 h-4 mr-2" />
                    {t('scan')}
                  </NavLink>
                  <NavLink to="/create-nft" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {t('createNFT')}
                  </NavLink>
                  <NavLink to="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    {t('about')}
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
                  className="flex items-center gap-3 px-4 py-2 rounded-lg backdrop-blur-md bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                >
                  <CreditCardIcon className="w-5 h-5 text-white" />
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 py-2 z-50"
                  >
                    <Link
                      to="/passports"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      {t('passports')}
                    </Link>
                    <Link
                      to="/create-nft"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <PlusIcon className="w-4 h-4" />
                      {t('create_passport')}
                    </Link>
                    <Link
                      to="/scan"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CameraIcon className="w-4 h-4" />
                      {t('scan')}
                    </Link>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <button
                onClick={connectWallet}
                className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 border border-white/20 hover:border-white/30 shadow-lg"
              >
                <CreditCardIcon className="w-5 h-5 text-white" />
                {t('connectWallet')}
              </button>
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
              <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
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
              <QrCodeIcon className="w-8 h-8 text-purple-400" />
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
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
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
              <div className="text-2xl font-bold text-blue-400 mb-2 flex items-center justify-center">
                <i className="fas fa-wallet text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step1')}</h3>
              <p className="text-gray-400 text-sm">{t('step1')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-purple-400 mb-2 flex items-center justify-center">
                <PlusIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step2')}</h3>
              <p className="text-gray-400 text-sm">{t('step2')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-green-400 mb-2 flex items-center justify-center">
                <QrCodeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step3')}</h3>
              <p className="text-gray-400 text-sm">{t('step3')}</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
                <CameraIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('step4')}</h3>
              <p className="text-gray-400 text-sm">{t('step4')}</p>
            </div>
          </div>
        </motion.div>
        <FAQ />
      </div>

      {/* 3D Box Section */}
      <ThreeDBoxSection />

      {/* Додаємо компонент Community */}
      <Community />
    </div>
  );
};

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
            <HeartIcon className="w-8 h-8 text-blue-400" />
            {t('about_us')}
          </h1>

          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <CircleStackIcon className="w-5 h-5 text-blue-400" />
                  {t('about_mission_title', 'Наша Місія')}
                </h2>
                <p className="text-gray-300 leading-relaxed flex items-start gap-3">
                  <LightBulbIcon className="w-4 h-4 text-gray-500 mt-1" />
                  {t('about_us_text1')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <GiftIcon className="w-5 h-5 text-blue-400" />
                  {t('about_offerings_title', 'Що ми пропонуємо')}
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4 flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-gray-500 mt-1" />
                  {t('about_offerings_desc', 'Ми надаємо комплексні інструменти для всіх учасників ринку:')}
                </p>
                <ul className="text-gray-300 space-y-3 ml-6">
                  <li className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-4 h-4 text-blue-400" />
                    <div>
                      <strong>{t('about_manufacturers', 'Виробникам:')}</strong>
                      <span className="ml-2">{t('about_manufacturers_desc', 'створення та управління цифровими паспортами продуктів')}</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShoppingBagIcon className="w-4 h-4 text-blue-400" />
                    <div>
                      <strong>{t('about_dealers', 'Дилерам:')}</strong>
                      <span className="ml-2">{t('about_dealers_desc', 'перевірка автентичності та відстеження продуктів')}</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <UsersIcon className="w-4 h-4 text-blue-400" />
                    <div>
                      <strong>{t('about_consumers', 'Споживачам:')}</strong>
                      <span className="ml-2">{t('about_consumers_desc', 'миттєва перевірка справжності продуктів через QR-коди')}</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <StarIcon className="w-5 h-5 text-blue-400" />
                  {t('about_benefits_title', 'Ключові переваги')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                      {t('secure_storage')}
                    </h3>
                    <p className="text-gray-300 text-sm flex items-start gap-2">
                      <LockClosedIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                      {t('secure_storage_desc')}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-blue-400" />
                      {t('about_convenience', 'Зручність')}
                    </h3>
                    <p className="text-gray-300 text-sm flex items-start gap-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                      {t('about_convenience_desc', 'Швидкий доступ через QR-коди та мобільні пристрої')}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <EyeIcon className="w-4 h-4 text-blue-400" />
                      {t('about_transparency', 'Прозорість')}
                    </h3>
                    <p className="text-gray-300 text-sm flex items-start gap-2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                      {t('about_transparency_desc', 'Повна історія продукту доступна кожному користувачу')}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      {t('about_speed', 'Швидкість')}
                    </h3>
                    <p className="text-gray-300 text-sm flex items-start gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                      {t('about_speed_desc', 'Миттєва верифікація автентичності продуктів')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <FlagIcon className="w-5 h-5 text-blue-400" />
                  {t('about_goal_title', 'Наша мета')}
                </h2>
                <p className="text-gray-300 leading-relaxed flex items-start gap-3">
                  <ArrowRightIcon className="w-4 h-4 text-gray-500 mt-1" />
                  {t('about_us_text3')}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <RocketLaunchIcon className="w-4 h-4 text-blue-400" />
                  {t('about_future_title', 'Технології майбутнього')}
                </h3>
                <p className="text-gray-300 text-sm flex items-start gap-3">
                  <CogIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                  {t('about_future_desc', 'Використовуючи найновіші технології блокчейну, ми створюємо екосистему, де кожен продукт має свій унікальний цифровий паспорт, що гарантує його автентичність та надає повну інформацію про його історію.')}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HandThumbUpIcon className="w-5 h-5 text-blue-400" />
                  {t('about_join_title', 'Приєднуйтесь до нас')}
                </h3>
                <p className="text-gray-300 text-sm flex items-start gap-3">
                  <UsersIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                  {t('about_join_desc', 'Станьте частиною революції в сфері цифрових паспортів продуктів. Разом ми створюємо безпечніше та прозоріше майбутнє для всіх учасників ринку.')}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{t('about_trust', 'Довіра')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{t('about_security', 'Безпека')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{t('about_innovation', 'Інновації')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ComicsSection = () => {
  const { t } = useTranslation();
  const [selectedComic, setSelectedComic] = useState(null);

  const comics = [
    {
      id: 1,
      title: t('comic_1_title'),
      image: sppProtocol,
      description: t('comic_1_desc'),
      fullStory: t('comic_1_fullStory'),
      technology: t('comic_1_technology'),
      link: "https://x.com/spprotocol/status/1759606829774393696"
    },
    {
      id: 2,
      title: t('comic_2_title'),
      image: solanaBreakpoint,
      description: t('comic_2_desc'),
      fullStory: t('comic_2_fullStory'),
      technology: t('comic_2_technology'),
      link: "https://x.com/spprotocol/status/1715423851086037007"
    },
    {
      id: 3,
      title: t('comic_3_title'),
      image: futureNftSpp,
      description: t('comic_3_desc'),
      fullStory: t('comic_3_fullStory'),
      technology: t('comic_3_technology'),
      link: "https://x.com/spprotocol/status/1725579428594950338"
    },
    {
      id: 4,
      title: t('comic_4_title'),
      image: updatingWithSpp,
      description: t('comic_4_desc'),
      fullStory: t('comic_4_fullStory'),
      technology: t('comic_4_technology'),
      link: "https://x.com/spprotocol/status/1720836551601614902"
    },
    {
      id: 5,
      title: t('comic_5_title'),
      image: skydiving,
      description: t('comic_5_desc'),
      fullStory: t('comic_5_fullStory'),
      technology: t('comic_5_technology'),
      link: "https://x.com/spprotocol/status/1722955959639535626"
    },
    {
      id: 6,
      title: t('comic_6_title'),
      image: updateDrivers,
      description: t('comic_6_desc'),
      fullStory: t('comic_6_fullStory'),
      technology: t('comic_6_technology'),
      link: "https://x.com/spprotocol/status/1757065942461944111"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        {/* Заголовок секції */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('comics_title').split(' ').map((word, index) =>
              index === 1 ? <span key={index} className="text-primary"> {word}</span> : word
            )}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('comics_subtitle')}
          </p>
        </div>

        {/* Сітка коміксів */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comics.map((comic) => (
            <div
              key={comic.id}
              className="group relative overflow-hidden rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
              onClick={() => setSelectedComic(comic)}
            >
              {/* Зображення коміксу */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={comic.image}
                  alt={comic.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Градієнтний оверлей */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Контент коміксу */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {comic.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {comic.description}
                </p>

                {/* Кнопка "Читати більше" */}
                <div className="mt-4 inline-flex items-center text-primary hover:text-primary/80 font-semibold text-sm transition-colors duration-300 group-hover:translate-x-1">
                  {t('comics_read_more')}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Індикатор завантаження */}
              <div className="absolute top-4 right-4 bg-primary/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                #{comic.id}
              </div>
            </div>
          ))}
        </div>

        {/* Модальне вікно для детального перегляду коміксу */}
        {selectedComic && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Заголовок та кнопка закриття */}
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-white">{selectedComic.title}</h2>
                  <button
                    onClick={() => setSelectedComic(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-8 h-8" />
                  </button>
                </div>

                {/* Зображення коміксу */}
                <div className="mb-6">
                  <img
                    src={selectedComic.image}
                    alt={selectedComic.title}
                    className="w-full rounded-xl shadow-2xl"
                  />
                </div>

                {/* Повна історія */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">{t('full_story')}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedComic.fullStory}
                  </p>
                </div>

                {/* Технологічні деталі */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">{t('technology_details')}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedComic.technology}
                  </p>
                </div>

                {/* Кнопка закриття */}
                <div className="text-center">
                  <button
                    onClick={() => setSelectedComic(null)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Кнопка "Побачити всі комікси" - прихована оскільки не функціональна */}
        {/* <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25">
            <span>{t('comics_view_all')}</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div> */}
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-6 border-t border-gray-800 text-center flex flex-col items-center gap-2 shadow-lg" style={{ boxShadow: '0 -2px 16px 0 rgba(16,16,32,0.25)' }}>
      {/* Логотип проекту */}
      <div className="flex items-center justify-center mb-2">
        <img
          src={whiteLogo}
          alt="Smart Product Passport"
          className="h-8 mr-2"
        />
        <span className="text-white font-semibold text-lg">Smart Product Passport</span>
      </div>
      <span className="text-sm">{t('footer_text')}</span>
      <div className="flex gap-4 justify-center items-center mt-2">
        <a
          href="https://x.com/SmartProductID"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors text-xl flex items-center justify-center"
        >
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href="https://discord.gg/UGKBgREr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <img src="https://svgl.app/library/discord.svg" alt="Discord" className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

const App = () => {
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState(null);
  const [role, setRole] = useState(() => {
    // Відновлюємо роль з localStorage при ініціалізації
    const savedRole = localStorage.getItem('userRole');
    return savedRole || null;
  });
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
          const publicKey = response.publicKey.toString();
          setWalletAddress(publicKey);

          // Відновлюємо роль при підключенні гаманця
          const savedRole = localStorage.getItem('userRole');
          if (savedRole) {
            setRole(savedRole);
          } else {
            // Якщо роль не збережена, визначаємо її
            await determineUserRole(publicKey);
          }

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

  // Виносимо логіку визначення ролі в окрему функцію
  const determineUserRole = async (publicKey) => {
    try {
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

      let newRole;
      if (publicKey === ADMIN_PUBLIC_KEY.toString()) {
        console.log('Setting role: admin');
        newRole = 'admin';
        // Автоматично ініціалізуємо список виробників, якщо адмін підключився
        await initializeManufacturerList();
      } else if (manufacturers.includes(publicKey)) {
        console.log('Setting role: manufacturer');
        newRole = 'manufacturer';
      } else {
        console.log('Setting role: user');
        newRole = 'user';
      }

      setRole(newRole);
      localStorage.setItem('userRole', newRole);
    } catch (error) {
      console.error('Error determining user role:', error);
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

      // Визначаємо роль користувача
      await determineUserRole(publicKey);

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
        console.error('Wallet not connected');
        throw new Error('Please connect your wallet first');
      }

      console.log('Initializing program...');
      const program = await initializeProgram();
      if (!program) {
        console.error('Program initialization failed');
        throw new Error('Failed to initialize program. Please check if the program is deployed.');
      }

      // Перевіряємо чи програма розгорнута
      console.log('Checking if program is deployed...');
      const programInfo = await connection.getAccountInfo(PROGRAM_ID);
      if (!programInfo) {
        console.error('Program not found on chain');
        throw new Error('Program not found on chain. Please make sure the program is deployed to devnet.');
      }

      // Перевіряємо чи користувач має права на створення паспорта
      console.log('Checking user role:', role);
      if (role !== 'manufacturer' && role !== 'admin') {
        console.error('User role not authorized:', role);
        throw new Error('Only manufacturers and admins can create passports');
      }

      console.log('Finding PDA for passport...');
      const [passportPda] = PublicKey.findProgramAddressSync([
        Buffer.from('passport'),
        Buffer.from(formData.serialNumber),
      ], PROGRAM_ID);

      // Перевіряємо чи паспорт вже існує
      console.log('Checking if passport already exists...');
      try {
        const existingPassport = await program.account.passport.fetch(passportPda);
        if (existingPassport) {
          console.error('Passport already exists:', existingPassport);
          throw new Error('Passport with this serial number already exists');
        }
      } catch (err) {
        if (!err.message.includes('Account does not exist')) {
          console.error('Error checking existing passport:', err);
          throw err;
        }
      }

      console.log('Creating passport transaction...');
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
      throw error; // Прокидаємо помилку далі для обробки в компоненті
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
        localStorage.removeItem('userRole'); // Видаляємо роль при відключенні
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
        <ComicsSection />
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