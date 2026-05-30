import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './index';
import { loginThunk, registerThunk, checkAuthThunk, logoutAction, setUserAction } from './authSlice';
import { User, UserRole } from '../types';

// Custom wrapper hook that bridges the original Zustand API interface to Redux Toolkit.
// This allows the frontend pages and components to remain unchanged.
export const useAuthStore = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    await dispatch(loginThunk({ email, password })).unwrap();
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    await dispatch(registerThunk({ name, email, password, role })).unwrap();
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const checkAuth = async () => {
    await dispatch(checkAuthThunk()).unwrap();
  };

  const setUser = (user: (User & { role: UserRole }) | null) => {
    dispatch(setUserAction(user));
  };

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth,
    setUser,
  };
};
