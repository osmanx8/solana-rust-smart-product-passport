import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUpload, FaImage, FaSpinner, FaQrcode, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import QRCode from 'qrcode.react';

const API_URL = 'http://localhost:3000/api'; // URL вашого бекенду

const CreateNFTPage = ({ mintPassport, handleInputChange, handleFileChange, formData, file, status, isProcessing }) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [nftAddress, setNftAddress] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);

      // Створюємо превью зображення
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Симулюємо прогрес завантаження
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Викликаємо handleFileChange з батьківського компонента
        await handleFileChange(e);
        
        // Завершуємо прогрес
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Показуємо повний прогрес на короткий час
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(0);
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      // Створюємо FormData для відправки файлу
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('metadata', JSON.stringify({
        ...formData,
        imageUrl: previewUrl
      }));

      // Відправляємо запит на бекенд для створення NFT
      const response = await fetch(`${API_URL}/nft/create`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to create NFT');
      }

      const { nftAddress: newNftAddress } = await response.json();
      
      // Зберігаємо адресу NFT
      setNftAddress(newNftAddress);
      
      // Генеруємо QR код
      const qrUrl = `https://explorer.solana.com/address/${newNftAddress}?cluster=devnet`;
      setQrCodeUrl(qrUrl);

      // Створюємо паспорт з адресою NFT
      await mintPassport(e, newNftAddress);

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
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error creating NFT passport:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
            Create Product Passport
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create a new digital passport for your product. Fill in the details below and upload any relevant documentation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                    placeholder="Enter product serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Production Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="productionDate"
                      value={formData.productionDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
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
                    Warranty Period (months)
                  </label>
                  <input
                    type="number"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter warranty period in months"
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
          </motion.div>

          {/* Right Column - File Upload and Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* File Upload Section */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Documentation</h2>
              <div className="space-y-4">
                {!file ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Instructions:</h3>
                      <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                        <li>Upload a clear product image (required)</li>
                        <li>Supported image formats: JPG, PNG, WebP</li>
                        <li>Maximum file size: 5MB</li>
                        <li>For best results, use square images (1:1 ratio)</li>
                      </ul>
                    </div>

                    {/* Upload Area */}
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isUploading 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="image/*"
                        required
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer flex flex-col items-center ${
                          isUploading ? 'pointer-events-none' : ''
                        }`}
                      >
                        {isUploading ? (
                          <div className="space-y-4 w-full">
                            <div className="relative w-12 h-12 mx-auto">
                              <FaSpinner className="w-full h-full text-blue-500 animate-spin" />
                              <FaCheck className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-500 transition-opacity ${
                                uploadProgress === 100 ? 'opacity-100' : 'opacity-0'
                              }`} />
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-300">
                              {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
                            </span>
                          </div>
                        ) : (
                          <>
                            <FaImage className="w-12 h-12 text-gray-400 mb-4" />
                            <span className="text-gray-300 mb-2">
                              Click to upload product image
                            </span>
                            <span className="text-sm text-gray-400">
                              Required: Product image (JPG, PNG, WebP)
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    <p className="text-sm text-red-400 mt-2">
                      * Product image is required
                    </p>
                  </>
                ) : (
                  /* Preview Section */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">Uploaded Image:</h3>
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          handleFileChange({ target: { files: [] } });
                        }}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="relative aspect-square w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Passport Preview</h2>
              <div className="space-y-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Product Information</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Serial Number:</span> {formData.serialNumber || '-'}</p>
                    <p><span className="text-gray-400">Model:</span> {formData.deviceModel || '-'}</p>
                    <p><span className="text-gray-400">Production Date:</span> {formData.productionDate || '-'}</p>
                    <p><span className="text-gray-400">Warranty:</span> {formData.warrantyPeriod ? `${formData.warrantyPeriod} months` : '-'}</p>
                    <p><span className="text-gray-400">Origin:</span> {formData.countryOfOrigin || '-'}</p>
                    <p><span className="text-gray-400">Manufacturer ID:</span> {formData.manufacturerId || '-'}</p>
                  </div>
                </div>
                {file && (
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Documentation</h3>
                    <p className="text-gray-300">
                      <span className="text-gray-400">File:</span> {file.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {nftAddress ? (
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
        ) : (
          <div className="mt-6 p-4 rounded-lg bg-gray-700/50 text-white text-center">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNFTPage; 