import axiosInstance from './axiosInstance';

/* ── Dummy fallback ── */
const DUMMY_CUSTOMERS = [
  { customerId: 1, customerName: 'Naya Rachel',  riskLevel: 'High' },
  { customerId: 2, customerName: 'Alex Johnson', riskLevel: 'Medium' },
  { customerId: 3, customerName: 'Sarah Connor', riskLevel: 'Low' },
];

export const fetchAllCustomers = async () => {
  try {
    const { data } = await axiosInstance.get('/api/customers/all');
    return data;
  } catch {
    console.warn('fetchAllCustomers → using dummy data');
    return DUMMY_CUSTOMERS;
  }
};

export const fetchCustomerById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/api/customers/${id}`);
    return data;
  } catch {
    console.warn('fetchCustomerById → using dummy data');
    return DUMMY_CUSTOMERS.find((c) => c.customerId === Number(id)) ?? DUMMY_CUSTOMERS[0];
  }
};
