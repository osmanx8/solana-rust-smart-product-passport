import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-700/50">
      <button
        onClick={onClick}
        className={`w-full py-4 px-6 flex items-center justify-between text-left transition-colors no-underline focus:outline-none focus:ring-0 focus:shadow-none ${
          isOpen ? 'bg-gray-800/80' : 'hover:bg-gray-800/30'
        }`}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-gray-300 mt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    {
      question: t('faq_manufacturer_q'),
      answer: t('faq_manufacturer_a')
    },
    {
      question: t('faq_consumer_q'),
      answer: t('faq_consumer_a')
    },
    {
      question: t('faq_retailer_q'),
      answer: t('faq_retailer_a')
    },
    {
      question: t('faq_warranty_q'),
      answer: t('faq_warranty_a')
    },
    {
      question: t('faq_authenticity_q'),
      answer: t('faq_authenticity_a')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        {t('faq_title')}
      </h2>
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
        {faqItems.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FAQ; 