import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:3000/api';

const CreateNFTPage = ({
  handleInputChange,
  handleFileChange,
  formData,
  file,
  status,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [nftAddress, setNftAddress] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [localStatus, setLocalStatus] = useState('');

  // Функція для генерації мокової NFT адреси
  const generateMockAddress = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFileChange(e);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalStatus('Creating passport...');

    try {
      // Генеруємо мокову NFT адресу
      const mockAddress = generateMockAddress();
      
      // Створюємо об'єкт паспорта
      const passport = {
        address: mockAddress,
        ...formData,
        imageUrl: previewUrl,
        createdAt: new Date().toISOString(),
      };

      // Зберігаємо в localStorage
      const savedPassports = JSON.parse(localStorage.getItem('passports') || '[]');
      savedPassports.push(passport);
      localStorage.setItem('passports', JSON.stringify(savedPassports));

      // Встановлюємо адресу та QR код
      setNftAddress(mockAddress);
      setQrCodeUrl(`https://explorer.solana.com/address/${mockAddress}?cluster=devnet`);
      setLocalStatus('Passport created successfully!');

      // Очищаємо форму
      e.target.reset();
      setPreviewUrl(null);
      handleFileChange({ target: { files: [] } });
      handleInputChange({ target: { name: 'serialNumber', value: '' } });
      handleInputChange({ target: { name: 'productionDate', value: '' } });
      handleInputChange({ target: { name: 'deviceModel', value: '' } });
      handleInputChange({ target: { name: 'warrantyPeriod', value: '' } });
      handleInputChange({ target: { name: 'countryOfOrigin', value: '' } });
      handleInputChange({ target: { name: 'manufacturerId', value: '' } });
    } catch (error) {
      console.error('Error creating passport:', error);
      setLocalStatus(`Error creating passport: ${error.message}`);
    }
  };

  // Очищаємо URL превью при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-700/50"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Create Product Passport
          </h1>

          {!nftAddress ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Production Date
                  </label>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Device Model
                  </label>
                  <input
                    type="text"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter device model"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter warranty period"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter country of origin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Manufacturer ID (optional)
                  </label>
                  <input
                    type="text"
                    name="manufacturerId"
                    value={formData.manufacturerId}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter manufacturer ID (optional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all ${
                  isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Passport...
                  </div>
                ) : (
                  'Create Passport'
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-6">NFT Passport Created!</h2>
              <div className="bg-gray-700/30 p-6 rounded-xl mb-6">
                <QRCode
                  value={qrCodeUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="mx-auto mb-4"
                />
                <p className="text-gray-300 mb-4">Scan this QR code to view the product passport</p>
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View on Solana Explorer
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setNftAddress(null);
                  setQrCodeUrl(null);
                }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Create Another Passport
              </motion.button>
            </motion.div>
          )}

          {(status || localStatus) && (
            <div className="mt-6 p-4 rounded-lg bg-gray-700/50 text-white text-center">
              {status || localStatus}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateNFTPage; 