import { create } from "zustand";
import { defaultFiles } from "../lib/templates";

interface FileState {
  files: Record<string, string>;
  setFiles: (files: Record<string, string>) => void;
  updateFile: (filename: string, code: string) => void;
  isLoading: boolean;
  setLoading: (status: boolean) => void;
  resetToDefaultFiles: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: defaultFiles,
  setFiles: (files) => set({ files }),
  updateFile: (filename, code) =>
    set((state) => ({
      files: { ...state.files, [filename]: code },
    })),
  isLoading: false,
  setLoading: (status) => set({ isLoading: status }),
  resetToDefaultFiles: () => set({ files: defaultFiles }),
})); 