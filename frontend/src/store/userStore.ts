import { create } from "zustand";

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface UserState {
  users: Record<string, RemoteUser>;
  setUsers: (cursors: Record<string, any>) => void;
  addUser: (id: string, name: string, color: string) => void;
  removeUser: (id: string) => void;
  updateCursor: (id: string, x: number, y: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: {},
  setUsers: (cursors) =>
    set(() => {
      const mapped: Record<string, RemoteUser> = {};
      Object.entries(cursors).forEach(([id, data]: [string, any]) => {
        mapped[id] = {
          id,
          name: data.name,
          color: data.color,
          x: data.x,
          y: data.y,
        };
      });
      return { users: mapped };
    }),
  addUser: (id, name, color) =>
    set((state) => ({
      users: {
        ...state.users,
        [id]: {
          id,
          name,
          color,
          x: 0,
          y: 0,
        },
      },
    })),
  removeUser: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.users;
      return { users: rest };
    }),
  updateCursor: (id, x, y) =>
    set((state) => {
      const user = state.users[id];
      if (!user) return state;
      return {
        users: {
          ...state.users,
          [id]: { ...user, x, y },
        },
      };
    }),
}));

