import React, { useState, useEffect } from 'react';
import { getTreasuryInfo, withdrawFromTreasury } from '../utils/nftCreator';
import { useWallet } from '@solana/wallet-adapter-react';

const TreasuryDashboard = () => {
  const { publicKey, signTransaction } = useWallet();
  const [treasuryInfo, setTreasuryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawRecipient, setWithdrawRecipient] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchTreasuryInfo();
  }, []);

  const fetchTreasuryInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTreasuryInfo();
      setTreasuryInfo(data.treasury);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction) {
      setError('Wallet not connected');
      return;
    }

    if (!withdrawAmount || !withdrawRecipient) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setWithdrawing(true);
      setError(null);

      // Конвертуємо SOL в lamports
      const amountLamports = Math.floor(parseFloat(withdrawAmount) * 1_000_000_000);
      
      // В реальному додатку тут буде підпис транзакції власником
      // Поки що використовуємо dummy signature
      const ownerSignature = "dummy_signature_for_demo";
      
      const result = await withdrawFromTreasury(
        amountLamports,
        withdrawRecipient,
        ownerSignature
      );

      console.log('Withdrawal successful:', result);
      
      // Оновлюємо інформацію про treasury
      await fetchTreasuryInfo();
      
      // Очищаємо форму
      setWithdrawAmount('');
      setWithdrawRecipient('');
      
      alert('Withdrawal successful!');
    } catch (err) {
      setError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const formatSol = (lamports) => {
    return (lamports / 1_000_000_000).toFixed(6);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Помилка завантаження Treasury</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchTreasuryInfo}
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
      {/* Treasury Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Treasury Wallet
        </h3>
        
        {treasuryInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Баланс Treasury</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatSol(treasuryInfo.balance)} SOL
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ ${(formatSol(treasuryInfo.balance) * 100).toFixed(2)} USD
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Зібрані комісії</div>
              <div className="text-xl font-semibold text-gray-900">
                {formatSol(treasuryInfo.total_collected_fees)} SOL
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ ${(formatSol(treasuryInfo.total_collected_fees) * 100).toFixed(2)} USD
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Адреса Treasury</div>
              <div className="text-xs font-mono text-gray-900 break-all">
                {treasuryInfo.address}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Вивід коштів
        </h3>
        
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сума (SOL)
            </label>
            <input
              type="number"
              step="0.000001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.001"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адреса отримувача
            </label>
            <input
              type="text"
              value={withdrawRecipient}
              onChange={(e) => setWithdrawRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kUMEKAPv1rd2TtnxsJrTvtZ6LDdjK7bmKFF8HzwYi95"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={withdrawing || !publicKey}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              withdrawing || !publicKey
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {withdrawing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Вивід...
              </div>
            ) : (
              'Вивести кошти'
            )}
          </button>
        </form>
        
        {!publicKey && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Підключіть гаманець для виводу коштів
            </p>
          </div>
        )}
      </div>

      {/* Treasury Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Статистика Treasury
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Середній fee за транзакцію</div>
            <div className="text-xl font-semibold text-gray-900">
              ~0.001 SOL
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (20% від базової комісії)
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Статус Treasury</div>
            <div className="text-xl font-semibold text-green-600">
              Активний
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Готовий до збору fee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard; 