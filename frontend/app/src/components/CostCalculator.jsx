import React, { useState, useEffect } from 'react';
import { getNftCreationCost, getCollectionCreationCost } from '../utils/nftCreator';

const CostCalculator = () => {
  const [nftCost, setNftCost] = useState(null);
  const [collectionCost, setCollectionCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [nftData, collectionData] = await Promise.all([
        getNftCreationCost(),
        getCollectionCreationCost()
      ]);

      setNftCost(nftData.cost);
      setCollectionCost(collectionData.cost);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatSol = (lamports) => {
    return (lamports / 1_000_000_000).toFixed(6);
  };

  const formatUSD = (solAmount, solPrice) => {
    return (solAmount * solPrice).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Помилка завантаження комісій</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchCosts}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Спробувати знову
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Комісія за створення NFT */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Комісія за створення NFT
        </h3>
        
        {nftCost && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Загальна вартість (без fee)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatSol(nftCost.total_cost)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(nftCost.total_sol, nftCost.sol_price)} USD
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Сервісний fee (20%)</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatSol(nftCost.service_fee)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(nftCost.service_fee_sol, nftCost.sol_price)} USD
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <div className="text-sm text-gray-600 mb-1">Загальна сума до сплати</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatSol(nftCost.total_with_fee)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(nftCost.total_with_fee_sol, nftCost.sol_price)} USD
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Детальний розбір комісій:</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mint Account (рахунок токена):</span>
                  <span className="font-medium">{formatSol(nftCost.mint_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Token Account (рахунок балансу):</span>
                  <span className="font-medium">{formatSol(nftCost.token_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Metadata Account (метадані):</span>
                  <span className="font-medium">{formatSol(nftCost.metadata_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Транзакційна комісія:</span>
                  <span className="font-medium">{formatSol(nftCost.transaction_fee)} SOL</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Комісія за створення колекції */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Комісія за створення колекції
        </h3>
        
        {collectionCost && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Загальна вартість (без fee)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatSol(collectionCost.total_cost)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(collectionCost.total_sol, collectionCost.sol_price)} USD
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Сервісний fee (20%)</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatSol(collectionCost.service_fee)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(collectionCost.service_fee_sol, collectionCost.sol_price)} USD
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <div className="text-sm text-gray-600 mb-1">Загальна сума до сплати</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatSol(collectionCost.total_with_fee)} SOL
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${formatUSD(collectionCost.total_with_fee_sol, collectionCost.sol_price)} USD
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Детальний розбір комісій:</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mint Account (рахунок токена):</span>
                  <span className="font-medium">{formatSol(collectionCost.mint_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Token Account (рахунок балансу):</span>
                  <span className="font-medium">{formatSol(collectionCost.token_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Metadata Account (метадані):</span>
                  <span className="font-medium">{formatSol(collectionCost.metadata_account)} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Транзакційна комісія:</span>
                  <span className="font-medium">{formatSol(collectionCost.transaction_fee)} SOL</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Інформація про оптимізацію */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">💡 Поради для економії</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Використовуйте <strong>batch transactions</strong> для створення кількох NFT одночасно</li>
                <li>Створюйте колекції заздалегідь, щоб уникнути повторних витрат</li>
                <li>Використовуйте <strong>Compressed NFTs</strong> для зменшення комісій (Metaplex)</li>
                <li>Моніторте ціну SOL для вибору оптимального часу</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator; 