import api from './api';

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.bookings;
};

export const getBooking = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.booking;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.booking;
};

export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
