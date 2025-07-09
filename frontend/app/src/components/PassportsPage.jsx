import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { fetchNftsByOwner, checkBackendHealth } from '../utils/nftCreator';

const PassportsPage = ({ 
  role, 
  passports, 
  formData, 
  handleInputChange, 
  handleFileChange, 
  mintPassport,
  handleSort,
  sortField,
  sortOrder,
  wallet
}) => {
  const [showForm, setShowForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Перевіряємо статус бекенду
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setBackendStatus(isHealthy ? 'healthy' : 'unhealthy');
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('unhealthy');
      }
    };
    
    checkBackend();
  }, []);

  // Завантажуємо NFT при зміні гаманця
  useEffect(() => {
    if (wallet && wallet.publicKey && backendStatus === 'healthy') {
      loadNfts();
    }
  }, [wallet, backendStatus]);

  const loadNfts = async () => {
    if (!wallet?.publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const walletAddress = wallet.publicKey.toString();
      const nftData = await fetchNftsByOwner(walletAddress);
      setNfts(nftData);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Backend Status Indicator */}
      {backendStatus === 'checking' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-yellow-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            Перевірка підключення до бекенду...
          </div>
        </motion.div>
      )}

      {backendStatus === 'unhealthy' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Бекенд недоступний. Перевірте підключення.
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Паспорти продуктів
        </h1>
        {(role === 'manufacturer' || role === 'admin') && backendStatus === 'healthy' && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Створити паспорт
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {showForm && (role === 'manufacturer' || role === 'admin') && backendStatus === 'healthy' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl mb-8 border border-gray-700/50 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-6">Створення нового паспорта</h2>
            <form onSubmit={mintPassport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Серійний номер</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Дата виробництва</label>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Модель пристрою</label>
                  <input
                    type="text"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Гарантійний період</label>
                  <input
                    type="text"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Країна походження</label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">ID виробника</label>
                  <input
                    type="text"
                    name="manufacturerId"
                    value={formData.manufacturerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Додаткові документи</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Створити паспорт
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/30">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    Назва NFT
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Метадані
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Символ
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Колекція
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Власник
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      Завантаження NFT...
                    </div>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      Помилка завантаження: {error}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && nfts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    NFT не знайдено. Створіть свій перший паспорт!
                  </td>
                </tr>
              )}

              {!loading && !error && nfts.map((nft) => (
                <motion.tr
                  key={nft.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.3)' }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.uri ? 'Так' : 'Немає'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.symbol || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.collection || 'Немає'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.owner ? `${nft.owner.slice(0, 4)}...${nft.owner.slice(-4)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {nft.uri ? (
                      <button
                        onClick={() => window.open(nft.uri, '_blank')}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        Переглянути <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      'Немає'
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PassportsPage; 