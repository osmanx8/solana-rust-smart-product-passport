import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateNFTPage from '../components/CreateNFTPage';
import { useTranslation } from 'react-i18next';

// Мокаємо react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Мокаємо функцію mintPassport
const mockMintPassport = vi.fn();
const mockHandleInputChange = vi.fn();
const mockHandleFileChange = vi.fn();

const defaultProps = {
  mintPassport: mockMintPassport,
  handleInputChange: mockHandleInputChange,
  handleFileChange: mockHandleFileChange,
  formData: {
    serialNumber: '',
    productionDate: '',
    deviceModel: '',
    warrantyPeriod: '',
    countryOfOrigin: '',
    manufacturerId: '',
    ipfsCid: '',
  },
  file: null,
  status: '',
  isProcessing: false,
};

describe('CreateNFTPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерить форму створення паспорта', () => {
    render(
      <BrowserRouter>
        <CreateNFTPage {...defaultProps} />
      </BrowserRouter>
    );

    // Перевіряємо заголовок
    expect(screen.getByText('Create Product Passport')).toBeInTheDocument();
    
    // Перевіряємо поля форми
    expect(screen.getByPlaceholderText('Enter product serial number')).toBeInTheDocument();
    expect(screen.getByLabelText('Production Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter device model')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter warranty period in months')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter country of origin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter manufacturer ID (optional)')).toBeInTheDocument();
  });

  it('обробляє зміни в полях форми', () => {
    render(
      <BrowserRouter>
        <CreateNFTPage {...defaultProps} />
      </BrowserRouter>
    );

    const serialNumberInput = screen.getByPlaceholderText('Enter product serial number');
    fireEvent.change(serialNumberInput, { target: { value: 'TEST123' } });

    expect(mockHandleInputChange).toHaveBeenCalled();
  });

  it('обробляє завантаження файлу', () => {
    render(
      <BrowserRouter>
        <CreateNFTPage {...defaultProps} />
      </BrowserRouter>
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Click to upload product image/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleFileChange).toHaveBeenCalled();
  });

  it('відправляє форму при сабміті', async () => {
    render(
      <BrowserRouter>
        <CreateNFTPage {...defaultProps} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Create Passport/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMintPassport).toHaveBeenCalled();
    });
  });

  it('показує статус обробки', () => {
    const processingProps = {
      ...defaultProps,
      isProcessing: true,
      status: 'Creating passport...',
    };

    render(
      <BrowserRouter>
        <CreateNFTPage {...processingProps} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/Creating Passport\.\.\./i);
  });

  it('показує помилку при невалідних даних', () => {
    const errorProps = {
      ...defaultProps,
      status: 'Error: Invalid data provided',
    };

    render(
      <BrowserRouter>
        <CreateNFTPage {...errorProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('Error: Invalid data provided')).toBeInTheDocument();
  });

  it('показує QR код після успішного створення', () => {
    const successProps = {
      ...defaultProps,
      nftAddress: 'test-address',
      qrCodeUrl: 'https://explorer.solana.com/address/test-address',
    };

    render(
      <BrowserRouter>
        <CreateNFTPage {...successProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('NFT Passport Created!')).toBeInTheDocument();
    expect(screen.getByText('View on Solana Explorer')).toBeInTheDocument();
  });
}); 