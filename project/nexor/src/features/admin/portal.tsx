import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  readStorageValue,
  removeStorageValue,
  writeStorageValue,
} from '../../lib/browser-storage';

export type AdminProductId = 'biteplaner';

export interface AdminProduct {
  id: AdminProductId;
  name: string;
  label: string;
  description: string;
  status: 'available' | 'coming-soon';
}

interface AdminPortalContextValue {
  products: AdminProduct[];
  selectedProductId: AdminProductId | null;
  selectedProduct: AdminProduct | null;
  setSelectedProductId: (productId: AdminProductId) => void;
  clearSelectedProduct: () => void;
}

const STORAGE_KEY = 'nexor-admin-selected-product';

const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'biteplaner',
    name: 'Biteplaner',
    label: 'Biteplaner',
    description: 'Operação completa do produto, ordens, usuários e configurações comerciais.',
    status: 'available',
  },
];

const AdminPortalContext = createContext<AdminPortalContextValue>({
  products: ADMIN_PRODUCTS,
  selectedProductId: null,
  selectedProduct: null,
  setSelectedProductId: () => undefined,
  clearSelectedProduct: () => undefined,
});

function readStoredSelection(): AdminProductId | null {
  const value = readStorageValue(STORAGE_KEY);
  return value === 'biteplaner' ? value : null;
}

export function AdminPortalProvider({ children }: PropsWithChildren) {
  const [selectedProductId, setSelectedProductIdState] = useState<AdminProductId | null>(() => readStoredSelection());

  const setSelectedProductId = useCallback((productId: AdminProductId) => {
    setSelectedProductIdState(productId);
    writeStorageValue(STORAGE_KEY, productId);
  }, []);

  const clearSelectedProduct = useCallback(() => {
    setSelectedProductIdState(null);
    removeStorageValue(STORAGE_KEY);
  }, []);

  const value = useMemo<AdminPortalContextValue>(() => {
    const selectedProduct = ADMIN_PRODUCTS.find((product) => product.id === selectedProductId) ?? null;

    return {
      products: ADMIN_PRODUCTS,
      selectedProductId,
      selectedProduct,
      setSelectedProductId,
      clearSelectedProduct,
    };
  }, [clearSelectedProduct, selectedProductId, setSelectedProductId]);

  return <AdminPortalContext.Provider value={value}>{children}</AdminPortalContext.Provider>;
}

export function useAdminPortal() {
  return useContext(AdminPortalContext);
}
