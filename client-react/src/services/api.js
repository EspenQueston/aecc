const API_BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['x-auth-token'] = token;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.msg || data.errors?.[0]?.msg || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  upload: async (url, formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${API_BASE}${url}`, { method: 'POST', headers, body: formData });
    return res.json();
  },
  uploadPut: async (url, formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${API_BASE}${url}`, { method: 'PUT', headers, body: formData });
    return res.json();
  }
};
