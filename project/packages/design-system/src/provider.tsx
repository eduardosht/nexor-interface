import { createContext, useContext, type ComponentType, type PropsWithChildren } from 'react';
import { getBrandTokens, type BrandTokens, type DesignSystemBrand } from './tokens';

interface DesignSystemContextValue {
  brand: DesignSystemBrand;
  tokens: BrandTokens;
}

const DesignSystemContext = createContext<DesignSystemContextValue>({
  brand: 'nexor',
  tokens: getBrandTokens('nexor'),
});

export type DesignSystemProviderProps = PropsWithChildren<{
  brand: DesignSystemBrand;
}>;

export function DesignSystemProvider({ brand, children }: DesignSystemProviderProps) {
  return (
    <DesignSystemContext.Provider value={{ brand, tokens: getBrandTokens(brand) }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export interface DesignSystemInitConfig {
  brand: DesignSystemBrand;
}

export interface InitializedDesignSystem {
  brand: DesignSystemBrand;
  DesignSystemRoot: ComponentType<PropsWithChildren>;
}

export function initDesignSystem({ brand }: DesignSystemInitConfig): InitializedDesignSystem {
  function DesignSystemRoot({ children }: PropsWithChildren) {
    return <DesignSystemProvider brand={brand}>{children}</DesignSystemProvider>;
  }

  DesignSystemRoot.displayName = `DesignSystemRoot(${brand})`;

  return {
    brand,
    DesignSystemRoot,
  };
}

export function useDesignSystem() {
  return useContext(DesignSystemContext);
}
