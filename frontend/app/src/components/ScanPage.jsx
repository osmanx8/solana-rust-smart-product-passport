import { useState } from 'react';
import { FaQrcode, FaSearch, FaCamera, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ScanPage = ({ handleQrScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleQrScan(manualInput);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Сканування QR-коду
        </h1>
        <p className="text-gray-300 text-lg">
          Відскануйте QR-код продукту або введіть серійний номер вручну для перевірки
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaQrcode className="text-blue-400" /> Сканування
          </h2>
          <div className="aspect-square bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center p-6 relative overflow-hidden group">
            {isScanning ? (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <FaCamera className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400 text-center">
              {isScanning ? 'Сканування...' : 'Натисніть для початку сканування'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsScanning(!isScanning)}
              className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {isScanning ? 'Зупинити' : 'Почати сканування'}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaSearch className="text-purple-400" /> Ручний ввід
          </h2>
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Серійний номер</label>
              <div className="relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Введіть серійний номер продукту"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/30 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-10"
                />
                <FaFileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Перевірити
            </motion.button>
          </form>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Як це працює?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400 mb-2">1</div>
            <p className="text-gray-400">Наведіть камеру на QR-код продукту</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400 mb-2">2</div>
            <p className="text-gray-400">Система автоматично зчитує інформацію</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400 mb-2">3</div>
            <p className="text-gray-400">Отримайте детальну інформацію про продукт</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScanPage; 