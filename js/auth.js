// Create auth.js in public/js folder
const auth = {
    loginUser: async (credentials) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    checkAuthStatus: () => {
      // Add auth status check logic if needed
    }
  };
  
  window.auth = auth;