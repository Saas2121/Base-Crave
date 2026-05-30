import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { packsAPI, Pack } from '../api/client';

interface PackState {
  packs: Pack[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: PackState = {
  packs: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

export const fetchPacksThunk = createAsyncThunk(
  'packs/fetchPacks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await packsAPI.getByStore();
      return data.filter((p: Pack) => p.status !== 'expired');
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to load packs';
      return rejectWithValue(message);
    }
  }
);

export const deletePackThunk = createAsyncThunk(
  'packs/deletePack',
  async (id: string, { rejectWithValue }) => {
    try {
      await packsAPI.delete(id);
      return id;
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to delete pack';
      return rejectWithValue(message);
    }
  }
);

export const updatePackThunk = createAsyncThunk(
  'packs/updatePack',
  async ({ id, data }: { id: string; data: Partial<Pack> }, { rejectWithValue }) => {
    try {
      const updated = await packsAPI.update(id, data);
      return updated;
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to update pack';
      return rejectWithValue(message);
    }
  }
);

export const uploadImageThunk = createAsyncThunk(
  'packs/uploadImage',
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const { data } = await packsAPI.uploadImage(id, file);
      const newImageUrl = data?.pack?.image_url || data?.imageUrl;
      return { id, imageUrl: newImageUrl };
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to upload image';
      return rejectWithValue(message);
    }
  }
);

const packSlice = createSlice({
  name: 'packs',
  initialState,
  reducers: {
    clearErrorAction(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Packs
      .addCase(fetchPacksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPacksThunk.fulfilled, (state, action: PayloadAction<Pack[]>) => {
        state.loading = false;
        state.packs = action.payload;
        state.error = null;
      })
      .addCase(fetchPacksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Pack
      .addCase(deletePackThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePackThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.packs = state.packs.filter(p => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deletePackThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      })
      // Update Pack
      .addCase(updatePackThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePackThunk.fulfilled, (state, action: PayloadAction<Pack>) => {
        state.saving = false;
        state.packs = state.packs.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
        state.error = null;
      })
      .addCase(updatePackThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Upload Image
      .addCase(uploadImageThunk.fulfilled, (state, action: PayloadAction<{ id: string; imageUrl: string }>) => {
        if (action.payload.imageUrl) {
          state.packs = state.packs.map(p => p.id === action.payload.id ? { ...p, image_url: action.payload.imageUrl } : p);
        }
        state.error = null;
      })
      .addCase(uploadImageThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearErrorAction } = packSlice.actions;
export default packSlice.reducer;
