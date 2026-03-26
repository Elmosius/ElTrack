import { create } from 'zustand';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type UserStore = {
  user: AuthUser | null;
  clearUser: () => void;
  setUser: (user: AuthUser) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  clearUser: () => set({ user: null }),
    setUser: (user) => set({ user }),
}));

export const useUser = () => useUserStore((state) => state.user);
export const useClearUser = () => useUserStore((state) => state.clearUser);
export const useSetUser = () => useUserStore((state) => state.setUser);
