const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'applyflow_auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized / token expired
  if (response.status === 401) {
    // If not calling login/register, clear token
    if (!endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      removeToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    if (data && data.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET',
    }),
};

export const applicationsApi = {
  list: ({ status, company, page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (company && company.trim()) params.append('company', company.trim());
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const queryString = params.toString();
    return request(`/applications/${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getStats: () =>
    request('/applications/stats', {
      method: 'GET',
    }),

  get: (id) =>
    request(`/applications/${id}`, {
      method: 'GET',
    }),

  create: (applicationData) =>
    request('/applications/', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),

  update: (id, applicationData) =>
    request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    }),

  delete: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
};
