import api from './axiosConfig';

// Announcements
export const announcementService = {
  getAll: (params) => api.get('/Announcement', { params }),
  getById: (id) => api.get(`/Announcement/${id}`),
  create: (data) => api.post('/Announcement', data),
  update: (id, data) => api.put(`/Announcement/${id}`, data),
  delete: (id) => api.delete(`/Announcement/${id}`),
};

// Characters
export const characterService = {
  getStats: (params) => api.get('/Character/stats', { params }),
  getStatById: (id) => api.get(`/Character/stats/${id}`),
  getPvPs: (params) => api.get('/Character/pvp', { params }),
  getPvPById: (id) => api.get(`/Character/pvp/${id}`),
  getPassives: (params) => api.get('/Character/passives', { params }),
  getSkills: (params) => api.get('/Character/skills', { params }),
  getAttacks: (params) => api.get('/Character/attacks', { params }),
  getAbilitiesSet: (tacticId) => api.get(`/Character/abilities/${tacticId}`),
};

// Feedback
export const feedbackService = {
  getNotifications: (params) => api.get('/Feedback/notifications', { params }),
  getReports: (params) => api.get('/Feedback/reports', { params }),
  getReportById: (id) => api.get(`/Feedback/reports/${id}`),
  markRead: (id) => api.post(`/Feedback/notifications/${id}/read`),
  markUnread: (id) => api.post(`/Feedback/notifications/${id}/unread`),
  approveReport: (id) => api.post(`/Feedback/reports/${id}/approve`),
};

// Items
export const itemService = {
  getAll: (params) => api.get('/Item', { params }),
  getById: (id) => api.get(`/Item/${id}`),
  create: (data) => api.post('/Item', data),
  update: (id, data) => api.put(`/Item/${id}`, data),
  delete: (id) => api.delete(`/Item/${id}`),
};

// Shop
export const shopService = {
  // Gem Bundles
  getGemBundles: (params) => api.get('/Shop/gem-bundles', { params }),
  getGemBundleById: (id) => api.get(`/Shop/gem-bundles/${id}`),
  createGemBundle: (data) => api.post('/Shop/gem-bundles', data),
  updateGemBundle: (id, data) => api.put(`/Shop/gem-bundles/${id}`, data),
  deleteGemBundle: (id) => api.delete(`/Shop/gem-bundles/${id}`),

  // Skin and Character Bundles
  getSkinBundles: (params) => api.get('/Shop/skin-and-character-bundles', { params }),
  getSkinBundleById: (id) => api.get(`/Shop/skin-and-character-bundles/${id}`),
  createSkinBundle: (data) => api.post('/Shop/skin-and-character-bundles', data),
  updateSkinBundle: (id, data) => api.put(`/Shop/skin-and-character-bundles/${id}`, data),
  deleteSkinBundle: (id) => api.delete(`/Shop/skin-and-character-bundles/${id}`),

  // Bundle Items (Bridge table)
  getAllBundleItems: (params) => api.get('/Shop/bundle-items', { params }),
  getItemsByBundleId: (bundleId) => api.get(`/Shop/bundle-items/${bundleId}`),
  createBundleItem: (data) => api.post('/Shop/bundle-items', data),
  updateBundleItem: (bundleId, itemId, data) => api.put(`/Shop/bundle-items/${bundleId}/item/${itemId}`, data),
  deleteBundleItem: (bundleId, itemId) => api.delete(`/Shop/bundle-items/${bundleId}/item/${itemId}`),

  // Orders
  getOrders: (params) => api.get('/Shop/orders', { params }),
  getOrderDetails: (orderId, params) => api.get(`/Shop/orders/${orderId}/details`, { params }),
  getTopUpHistory: (params) => api.get('/Shop/topup-history', { params }),
};

// Users
export const userService = {
  getAll: (params) => api.get('/User', { params }),
  getById: (id) => api.get(`/User/${id}`),
  create: (data) => api.post('/User', data),
  update: (id, data) => api.put(`/User/${id}`, data),
  ban: (id, data) => api.delete(`/User/${id}`, { data }),
  getBanLogs: (userId, params) => api.get(`/User/${userId}/ban-logs`, { params }),
  getAllBanLogs: (params) => api.get('/User/ban-logs', { params }),
  createBanLog: (data) => api.post('/User/ban-logs', data),
  updateBanLog: (id, data) => api.put(`/User/ban-logs/${id}`, data),
  deleteBanLog: (id) => api.delete(`/User/ban-logs/${id}`),
  
  // User Bundles
  getAllUserBundles: (params) => api.get('/User/bundles', { params }),
  getUserBundles: (userId, params) => api.get(`/User/${userId}/bundles`, { params }),
  createUserBundle: (data) => api.post('/User/bundles', data),
  updateUserBundle: (userId, skinBundleId, gemBundleId, data) => api.put(`/User/${userId}/bundles/skin/${skinBundleId}/gem/${gemBundleId}`, data),
  deleteUserBundle: (userId, skinBundleId, gemBundleId) => api.delete(`/User/${userId}/bundles/skin/${skinBundleId}/gem/${gemBundleId}`),
};

// User Items
export const userItemService = {
  getAll: (params) => api.get('/UserItem', { params }),
  getByUserId: (userId, params) => api.get(`/UserItem/${userId}`, { params }),
  create: (data) => api.post('/UserItem', data),
  update: (userId, itemId, data) => api.put(`/UserItem/${userId}/items/${itemId}`, data),
  delete: (userId, itemId) => api.delete(`/UserItem/${userId}/items/${itemId}`),
};
