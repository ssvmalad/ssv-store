export const getApiUrl = (path) => {
  if (typeof window === 'undefined') return path;
  
  const origin = window.location.origin;
  const isWebView = origin.startsWith('file://') || 
                    origin.startsWith('capacitor://') || 
                    origin.includes('localhost') && !window.location.port; // Android Capacitor runs on http://localhost by default without port
  
  const baseUrl = isWebView ? 'https://ssv-store.vercel.app' : '';
  return `${baseUrl}${path}`;
};
