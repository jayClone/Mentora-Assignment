import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  return useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    setAuth: state.setAuth,
    logout: state.logout,
    updateUser: state.updateUser,
  }));
};
