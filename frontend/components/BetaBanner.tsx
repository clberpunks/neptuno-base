// components/BetaBanner.tsx
import { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from 'next-i18next';

const BetaBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');

  return (
    <>
      <div className="bg-yellow-500 text-black py-2 px-4 text-center text-sm font-bold">
        <span>{t('beta_banner.message')}</span>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="underline hover:text-yellow-800 focus:outline-none ml-1"
        >
          {t('beta_banner.learn_more')}
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">{t('beta_modal.title')}</h2>
          <p className="mb-4">{t('beta_modal.description_1')}</p>
          <p className="mb-4">{t('beta_modal.description_2')}</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('beta_modal.understand')}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default BetaBanner;