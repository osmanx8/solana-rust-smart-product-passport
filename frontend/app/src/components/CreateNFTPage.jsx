import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Buffer } from 'buffer'
import process from 'process'
import { getSolanaExplorerUrl } from '../utils/nftUtils';

if (!window.Buffer) window.Buffer = Buffer
if (!window.process) window.process = process

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CreateNFTPage = ({
  handleInputChange,
  handleFileChange,
  formData,
  file,
  status,
  isProcessing,
  mintPassport,
  nftAddress,
  clearNftAddress,
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [localStatus, setLocalStatus] = useState('');

  useEffect(() => {
    if (nftAddress) {
      setQrCodeUrl(getSolanaExplorerUrl(nftAddress));
    }
  }, [nftAddress]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      handleFileChange(e);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      handleFileChange({ target: { files: [selectedFile] } });
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalStatus('Creating NFT passport...');
    try {
      await mintPassport(e);
      setLocalStatus('NFT passport created successfully!');
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
      setLocalStatus(`Error creating NFT passport: ${error.message}`);
    }
  };

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
            Create NFT Product Passport
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
                
                {/* File Upload Area */}
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-blue-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
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
                
                {/* Image Preview */}
                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Product preview"
                        className="max-w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          handleFileChange({ target: { files: [] } });
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                    {file && (
                      <div className="mt-2 text-sm text-gray-400">
                        <p>File: {file.name}</p>
                        <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Type: {file.type}</p>
                      </div>
                    )}
                  </motion.div>
                )}
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
                    Creating NFT...
                  </div>
                ) : (
                  'Create NFT Passport'
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-6">NFT Product Passport Created!</h2>

              <div className="bg-gray-700/30 p-6 rounded-xl mb-6">
                <QRCode
                  value={qrCodeUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="mx-auto mb-4"
                />
                <p className="text-gray-300 mb-4">Scan this QR code to view the NFT product passport</p>
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
                onClick={clearNftAddress}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Create Another NFT Passport
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