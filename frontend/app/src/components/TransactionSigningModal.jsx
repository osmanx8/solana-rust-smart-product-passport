import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  WalletIcon 
} from '@heroicons/react/24/outline';

const TransactionSigningModal = ({ 
  isOpen, 
  onClose, 
  currentStep, 
  totalSteps, 
  stepTitle, 
  stepDescription, 
  status, 
  error 
}) => {
  if (!isOpen) return null;

  const getStepIcon = () => {
    switch (status) {
      case 'pending':
        return <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />;
      default:
        return <WalletIcon className="w-8 h-8 text-blue-500" />;
    }
  };

  const getStepColor = () => {
    switch (status) {
      case 'pending':
        return 'border-blue-500 bg-blue-500/10';
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Підпис транзакції
            </h2>
            <p className="text-gray-400">
              Крок {currentStep} з {totalSteps}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Current Step */}
          <div className={`border-2 rounded-lg p-4 mb-4 ${getStepColor()}`}>
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{stepTitle}</h3>
                <p className="text-sm text-gray-300">{stepDescription}</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'pending' && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Очікування підпису...</span>
              </div>
              <p className="text-sm text-gray-400">
                Будь ласка, підпишіть транзакцію у вашому гаманці
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Транзакція підписана!</span>
              </div>
              <p className="text-sm text-gray-400">
                Транзакція успішно підписана та відправлена
              </p>
            </div>
          )}

          {status === 'error' && error && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>Помилка підпису</span>
              </div>
              <p className="text-sm text-red-300 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Закрити
              </button>
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-300">Підготовка метаданих</span>
            </div>
            
            {currentStep >= 2 && (
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep === 2 ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {currentStep === 2 ? (
                    <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-300">Створення транзакції</span>
              </div>
            )}
            
            {currentStep >= 3 && (
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep === 3 ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {currentStep === 3 ? (
                    <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-300">Підпис гаманцем</span>
              </div>
            )}
            
            {currentStep >= 4 && (
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep === 4 ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {currentStep === 4 ? (
                    <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-300">Відправка транзакції</span>
              </div>
            )}
          </div>

          {/* Close Button */}
          {status !== 'error' && (
            <div className="text-center">
              <button
                onClick={onClose}
                disabled={status === 'pending'}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {status === 'pending' ? 'Зачекайте...' : 'Закрити'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionSigningModal; 