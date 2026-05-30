import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './index';
import { fetchPacksThunk, deletePackThunk, updatePackThunk, uploadImageThunk, clearErrorAction } from './packSlice';
import { Pack } from '../api/client';

// Custom wrapper hook to bridge the original Zustand API interface to Redux Toolkit.
export const usePackStore = () => {
  const dispatch = useDispatch<AppDispatch>();
  const packState = useSelector((state: RootState) => state.pack);

  const fetchPacks = async () => {
    await dispatch(fetchPacksThunk()).unwrap();
  };

  const deletePack = async (id: string) => {
    await dispatch(deletePackThunk(id)).unwrap();
  };

  const updatePack = async (id: string, data: Partial<Pack>) => {
    return await dispatch(updatePackThunk({ id, data })).unwrap();
  };

  const uploadImage = async (id: string, file: File) => {
    await dispatch(uploadImageThunk({ id, file })).unwrap();
  };

  const clearError = () => {
    dispatch(clearErrorAction());
  };

  return {
    ...packState,
    fetchPacks,
    deletePack,
    updatePack,
    uploadImage,
    clearError,
  };
};
