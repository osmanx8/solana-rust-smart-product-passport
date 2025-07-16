import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Buffer } from 'buffer'
import process from 'process'
import { getSolanaExplorerUrl } from '../utils/nftUtils';
import CostCalculator from './CostCalculator';
import { fetchCollectionsByOwner } from '../utils/nftCreator';
import { createCollectionWithMetaplex } from '../utils/collectionCreator';
import { uploadImage } from '../utils/nftCreator';
import { getNames } from 'country-list';

if (!window.Buffer) window.Buffer = Buffer
if (!window.process) window.process = process

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COUNTRIES = Object.values(getNames());

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
  collectionImage,
  setCollectionImage,
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [localStatus, setLocalStatus] = useState('');
  const [collectionImagePreview, setCollectionImagePreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  // Видаляю все, що стосується створення нової колекції у цій формі
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (window.solana && window.solana.publicKey) {
      setWalletAddress(window.solana.publicKey.toString());
    } else if (window.solana && window.solana.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true }).then(res => {
        setWalletAddress(res.publicKey.toString());
      });
    }
  }, []);

  useEffect(() => {
    if (!walletAddress) return;
    fetchCollectionsByOwner(walletAddress)
      .then(data => {
        setCollections(data.collections || []);
      })
      .catch(() => setCollections([]));
  }, [walletAddress]);

  const handleCollectionSelect = (e) => {
    const value = e.target.value;
    setSelectedCollection(value);
    // Видаляю все, що стосується створення нової колекції у цій формі
    handleInputChange({ target: { name: 'collectionName', value } });
  };

  // Видаляю все, що стосується створення нової колекції у цій формі
  // const handleNewCollectionNameChange = (e) => {
  //   setNewCollectionName(e.target.value);
  //   handleInputChange({ target: { name: 'collectionName', value: e.target.value } });
  // };

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

  const handleCollectionImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setCollectionImage(selectedFile);
      setCollectionImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  // Видаляю все, що стосується створення нової колекції у цій формі
  // const handleCreateCollection = async () => {
  //   if (!window.solana || !window.solana.publicKey || !newCollectionName || !collectionImage) {
  //     alert('Введіть назву колекції та виберіть зображення!');
  //     return;
  //   }
  //   try {
  //     // 1. Завантажити зображення і отримати URL
  //     const imageUrl = await uploadImage(collectionImage);
  //     // 2. Створити колекцію з imageUrl
  //     const collectionData = {
  //       name: newCollectionName,
  //       image: imageUrl,
  //     };
  //     const address = await createCollectionWithMetaplex(window.solana, collectionData);
  //     // Додаємо нову колекцію у список і вибираємо її
  //     const newCol = { name: newCollectionName, address };
  //     setCollections(prev => [...prev, newCol]);
  //     setSelectedCollection(newCollectionName);
  //     setShowNewCollectionInput(false);
  //     setNewCollectionName('');
  //     handleInputChange({ target: { name: 'collectionName', value: newCollectionName } });
  //     alert('Колекцію створено!');
  //   } catch (e) {
  //     alert('Помилка створення колекції: ' + e.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionImage) {
      alert('Будь ласка, виберіть зображення для колекції (Collection Image)');
      return;
    }
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
      handleInputChange({ target: { name: 'collectionName', value: '' } });
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
            {t('createNFTProductPassport')}
          </h1>

          {/* Калькулятор комісій */}
          {/* <div className="mb-8">
            <CostCalculator />
          </div> */}

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
                  <select
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('collection_name')}
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      name="collectionSelect"
                      value={selectedCollection}
                      onChange={handleCollectionSelect}
                      className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">{t('collection_placeholder')}</option>
                      {collections.map((col) => (
                        <option key={col.address || col.name} value={col.name}>{col.name}</option>
                      ))}
                      {/* Видаляю опцію "__new__" */}
                    </select>
                    {/* Видаляю кнопку створення нової колекції */}
                  </div>
                  {/* Видаляю поле для нової колекції */}
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

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collection Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="collection-image-upload"
                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="collection-image-upload"
                          name="collection-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleCollectionImageChange}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {collectionImagePreview && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                    <div className="relative inline-block">
                      <img
                        src={collectionImagePreview}
                        alt="Collection preview"
                        className="max-w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionImage(null);
                          setCollectionImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                    {collectionImage && (
                      <div className="mt-2 text-sm text-gray-400">
                        <p>File: {collectionImage.name}</p>
                        <p>Size: {(collectionImage.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Type: {collectionImage.type}</p>
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
            <div className="mt-8 text-center">
              <h2 className="text-xl font-bold text-green-400 mb-4">NFT Passport created successfully!</h2>
              <div className="text-gray-200 mb-2">NFT Mint Address:</div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-lg font-mono text-blue-400 break-all">{nftAddress}</div>
                <button
                  className={`mt-2 px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm text-white border border-gray-500 transition-colors ${copied ? 'bg-green-600 border-green-700' : ''}`}
                  onClick={() => {
                    navigator.clipboard.writeText(nftAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
                <a
                  href={`https://explorer.solana.com/address/${nftAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  View on Solana Explorer
                </a>
              </div>
              <button
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                onClick={clearNftAddress}
              >
                Create Another NFT
              </button>
            </div>
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