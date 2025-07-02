export const isAuthEnabled = () => {
  return import.meta.env.VITE_ENABLE_AUTH === 'true';
};
