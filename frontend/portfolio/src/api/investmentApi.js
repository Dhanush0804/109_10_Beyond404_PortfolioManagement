import axiosInstance from './axiosInstance';

const buildDummyInvestments = (customerId) => [
  { assetId: 1,  customerId, stockId: 1, transactionType: 'BUY',  transactionAmount: 18950.00, transactionTimestamp: '2024-01-15T10:30:00' },
  { assetId: 2,  customerId, stockId: 2, transactionType: 'BUY',  transactionAmount: 24820.00, transactionTimestamp: '2024-02-20T14:15:00' },
  { assetId: 3,  customerId, stockId: 3, transactionType: 'BUY',  transactionAmount: 41560.00, transactionTimestamp: '2024-03-05T09:45:00' },
  { assetId: 4,  customerId, stockId: 4, transactionType: 'BUY',  transactionAmount: 17890.00, transactionTimestamp: '2024-03-22T11:00:00' },
  { assetId: 5,  customerId, stockId: 5, transactionType: 'BUY',  transactionAmount: 87530.00, transactionTimestamp: '2024-04-10T16:30:00' },
  { assetId: 6,  customerId, stockId: 2, transactionType: 'SELL', transactionAmount: 12000.00, transactionTimestamp: '2024-05-01T13:20:00' },
  { assetId: 7,  customerId, stockId: 6, transactionType: 'BUY',  transactionAmount: 19840.00, transactionTimestamp: '2024-06-15T10:00:00' },
];

export const fetchInvestmentsByCustomer = async (customerId) => {
  try {
    // PSEUDO endpoint – replace with real once available
    const { data } = await axiosInstance.get(`/api/investments`, { params: { customerId } });
    return data;
  } catch {
    console.warn('fetchInvestmentsByCustomer → using dummy data');
    return buildDummyInvestments(customerId);
  }
};

export const fetchAllInvestments = async () => {
  try {
    const { data } = await axiosInstance.get('/api/investments');
    return data;
  } catch {
    console.warn('fetchAllInvestments → using dummy data');
    return buildDummyInvestments(1);
  }
};
