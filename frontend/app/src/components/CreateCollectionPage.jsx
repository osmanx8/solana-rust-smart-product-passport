import React, { useState } from 'react';
import { createCollectionWithMetaplex } from '../utils/collectionCreator';
import { useTranslation } from 'react-i18next';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CreateCollectionPage = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.solana || !window.solana.publicKey || !name) {
      setStatus(t('create_collection_required'));
      return;
    }
    setStatus(t('create_collection_submit') + '...');
    try {
      const collectionData = { name };
      const address = await createCollectionWithMetaplex(window.solana, collectionData);
      // Додаю запит на бекенд:
      await fetch(`${BACKEND_URL}/api/create-collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          symbol: name.toUpperCase().slice(0, 3),
          description: `Collection for ${name}`,
          wallet_address: window.solana.publicKey.toString(),
          collection_address: address,
        }),
      });
      setStatus(t('create_collection_success'));
      setName('');
    } catch (e) {
      setStatus(t('create_collection_error') + ': ' + e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('create_collection_title')}</h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">{t('create_collection_name_label')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder={t('create_collection_name_placeholder')}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          {t('create_collection_submit')}
        </button>
        {status && <div className="mt-4 text-center text-white">{status}</div>}
      </form>
    </div>
  );
};

export default CreateCollectionPage; 