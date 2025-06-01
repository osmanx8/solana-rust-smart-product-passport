import { useState, useEffect, useRef } from 'react';
import { FaQrcode, FaSearch, FaCamera, FaFileAlt, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API_URL = 'http://localhost:3000/api'; // URL вашого бекенду

const ScanPage = () => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      await handleScan(decodedText);
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error scanning QR code:', err);
    }
  };

  const onScanFailure = (error) => {
    console.warn('QR Code scan failed:', error);
  };

  const handleScan = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // Відправляємо запит на бекенд для отримання даних NFT
      const response = await fetch(`${API_URL}/nft/${data}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFT data');
      }
      const nftData = await response.json();
      setNftData(nftData);
    } catch (error) {
      console.error('Error fetching NFT:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 rounded-2xl p-8 shadow-xl border border-gray-700/50"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Scan Product Passport</h1>

          <div className="space-y-6">
            {/* Manual Input Form */}
            <form onSubmit={handleManualSubmit} className="flex gap-4">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter NFT address manually"
                className="flex-1 bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaSearch /> Search
              </button>
            </form>

            {/* Scan Button */}
            <div className="text-center">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                {isScanning ? (
                  <>
                    <FaTimes /> Stop Scanning
                  </>
                ) : (
                  <>
                    <FaCamera /> Start Scanning
                  </>
                )}
              </button>
            </div>

            {/* QR Scanner */}
            {isScanning && (
              <div id="qr-reader" className="w-full max-w-sm mx-auto" />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center text-gray-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                <p className="mt-2">Loading NFT data...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* NFT Data Display */}
            {nftData && !isLoading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700/30 rounded-xl p-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{nftData.name}</h2>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                      {nftData.symbol}
                    </span>
                  </div>

                  {nftData.image && (
                    <div className="aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden">
                      <img
                        src={nftData.image}
                        alt={nftData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {nftData.attributes?.map((attr, index) => (
                      <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">{attr.trait_type}</div>
                        <div className="text-white font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <a
                      href={`https://explorer.solana.com/address/${nftData.address}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View on Solana Explorer <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScanPage; 