import axiosInstance from './axiosInstance';

export const fetchAssetHoldingsByCustomer = async (customerId) => {
  const { data } = await axiosInstance.get(`/api/asset-holdings/customer/${customerId}`);
  return Array.isArray(data) ? data : [];
};
