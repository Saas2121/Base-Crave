import { create } from 'zustand'
import { packsAPI, Pack } from '../api/client'

interface PackState {
  packs: Pack[]
  loading: boolean
  saving: boolean
  deleting: boolean
  error: string | null
  fetchPacks: () => Promise<void>
  deletePack: (id: string) => Promise<void>
  updatePack: (id: string, data: Partial<Pack>) => Promise<Pack>
  uploadImage: (id: string, file: File) => Promise<void>
  clearError: () => void
}

export const usePackStore = create<PackState>((set) => ({
  packs: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,

  fetchPacks: async () => {
    set({ loading: true, error: null })
    try {
      const data = await packsAPI.getByStore()
      set({ packs: data, loading: false })
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to load packs'
      set({ error: message, loading: false })
    }
  },

  deletePack: async (id: string) => {
    set({ deleting: true, error: null })
    try {
      await packsAPI.delete(id)
      set((state) => ({
        packs: state.packs.filter(p => p.id !== id),
        deleting: false,
      }))
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to delete pack'
      set({ error: message, deleting: false })
      throw err
    }
  },

  updatePack: async (id: string, data: Partial<Pack>) => {
    set({ saving: true, error: null })
    try {
      const updated = await packsAPI.update(id, data)
      set((state) => ({
        packs: state.packs.map(p => p.id === id ? { ...p, ...updated } : p),
        saving: false,
      }))
      return updated
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to update pack'
      set({ error: message, saving: false })
      throw err
    }
  },

  uploadImage: async (id: string, file: File) => {
    try {
      const { data } = await packsAPI.uploadImage(id, file)
      const newImageUrl = data?.pack?.image_url || data?.imageUrl
      if (newImageUrl) {
        set((state) => ({
          packs: state.packs.map(p => p.id === id ? { ...p, image_url: newImageUrl } : p),
        }))
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to upload image'
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
