"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;          // slug du produit
  name: string;
  brand: string;
  priceTTC: number;           // prix unitaire TTC
  quantity: number;
  imageSrc?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /**
   * Passe à true une fois le panier relu depuis localStorage.
   *
   * Indispensable : au premier rendu client, `items` vaut [] même quand le
   * panier n'est pas vide. Une page qui décide quelque chose à cet instant
   * (le checkout redirigeait vers /panier) le fait sur une lecture fausse.
   * Toute logique du type « si le panier est vide alors… » doit d'abord
   * attendre ce drapeau.
   */
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "mp-cart",
      storage: createJSONStorage(() => {
        // Évite l'erreur SSR : retourne un storage no-op si window indispo
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ items: state.items }), // ne persiste pas isOpen
      // Appelé à la fin de la relecture, y compris en cas d'échec (storage
      // plein, mode privé) : on débloque l'interface dans tous les cas.
      onRehydrateStorage: () => (state) => {
        useCart.setState({ hasHydrated: true });
        void state;
      },
    }
  )
);

// Sélecteurs utilitaires (perfs : évite re-renders inutiles)
export function useCartCount() {
  return useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
}

export function useCartTotal() {
  return useCart((s) =>
    s.items.reduce((acc, i) => acc + i.priceTTC * i.quantity, 0)
  );
}
