import api from './axiosConfig';

// Banners
export const bannerService = {
  getAll: () => api.get('/Banner'),
  getById: (id) => api.get(`/Banner/${id}`),
  create: (data) => api.post('/Banner', data),
  update: (id, data) => api.put(`/Banner/${id}`, data),
  delete: (id) => api.delete(`/Banner/${id}`),
};

export const bannerItemService = {
  getAll: () => api.get('/BannerItem'),
  getById: (bannerId, itemId) => api.get(`/BannerItem/${bannerId}/${itemId}`),
  create: (data) => api.post('/BannerItem', data),
  delete: (bannerId, itemId) => api.delete(`/BannerItem/${bannerId}/${itemId}`),
};

export const gameItemService = {
  getAll: () => api.get('/Item'),
  getById: (id) => api.get(`/Item/${id}`),
  create: (data) => api.post('/Item', data),
  update: (id, data) => api.put(`/Item/${id}`, data),
  delete: (id) => api.delete(`/Item/${id}`),
};

export const notificationService = {
  getAll: () => api.get('/Notification'),
  getById: (id) => api.get(`/Notification/${id}`),
};

export const orderService = {
  getAll: () => api.get('/Order'),
  getById: (id) => api.get(`/Order/${id}`),
};

export const orderDetailService = {
  getAll: () => api.get('/OrderDetail'),
  getById: (orderId, productId) => api.get(`/OrderDetail/${orderId}/${productId}`),
};

export const reportService = {
  getAll: () => api.get('/Report'),
  getById: (id) => api.get(`/Report/${id}`),
  approve: (id) => api.post(`/Report/${id}/approve`),
};

export const userService = {
  getAll: () => api.get('/User'),
  getById: (id) => api.get(`/User/${id}`),
  create: (data) => api.post('/User', data),
  update: (id, data) => api.put(`/User/${id}`, data),
  delete: (id) => api.delete(`/User/${id}`),
};

export const userItemService = {
  getAll: () => api.get('/UserItem'),
  getByUserId: (userId) => api.get(`/UserItem/user/${userId}`),
  getById: (id) => api.get(`/UserItem/${id}`),
  create: (data) => api.post('/UserItem', data),
  update: (id, data) => api.put(`/UserItem/${id}`, data),
  delete: (id) => api.delete(`/UserItem/${id}`),
};

