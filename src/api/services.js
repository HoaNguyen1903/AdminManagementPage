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
};

// Orders (PayOS & Management)
export const orderService = {
  getAll: (params) => api.get('/Order', { params }),
  getById: (id) => api.get(`/Order/${id}`),
  getDetails: (orderId, params) => api.get(`/Order/${orderId}/details`, { params }),
  createPayment: (data) => api.post('/Order', data),
  cancelPayment: (orderId, cancellationReason) => api.post(`/Order/${orderId}/cancel`, null, { params: { cancellationReason } }),
};

// Users
export const userService = {
  getAll: (params) => api.get('/User', { params }),
  getById: (id) => api.get(`/User/${id}`),
  getStatus: (id, onlineThresholdSeconds = 60) => api.get(`/User/${id}/status`, { params: { onlineThresholdSeconds } }),
  create: (data) => api.post('/User', data),
  update: (id, data) => api.put(`/User/${id}`, data),
  ban: (id, data) => api.delete(`/User/${id}`, { data }),
  heartbeat: () => api.post('/User/me/heartbeat'),
  logout: () => api.post('/User/me/logout'),
  uploadAvatar: (formData) => api.post('/User/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
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
  getUserItemsWithNames: (userId, params) => api.get(`/User/${userId}/items`, { params }),
};

// Staff
export const staffService = {
  getProfile: () => api.get('/Staff/profile'),
  updateProfile: (data) => api.put('/Staff/profile', data),
  uploadAvatar: (formData) => api.post('/Staff/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Dashboard & Analytics
export const dashboardService = {
  getRevenue: (params) => api.get('/Dashboard/revenue', { params }),
  getBundleRanking: (params) => api.get('/Dashboard/bundle-ranking', { params }),
  getPlayerStats: (params) => api.get('/Dashboard/player-stats', { params }),
  getPlayerHistory: (params) => api.get('/Dashboard/player-history', { params }),
  getCurrentStats: () => api.get('/Dashboard/current-stats'),
  getUserRanking: (params) => api.get('/Dashboard/top-spenders', { params }),
};
