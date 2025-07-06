export const isWaitlistEnabled = () => {
  return import.meta.env.VITE_ENABLE_WAITLIST === 'true';
};
