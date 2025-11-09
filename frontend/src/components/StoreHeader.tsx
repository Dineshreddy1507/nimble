import type { ReactNode } from 'react';

interface StoreHeaderProps {
  storeName: string;
  subtitle?: ReactNode;
  cartCount: number;
  onToggleCart: () => void;
}

export const StoreHeader = ({
  storeName,
  subtitle,
  cartCount,
  onToggleCart,
}: StoreHeaderProps) => (
  <header className="store-header">
    <div>
      <h1>{storeName}</h1>
      {subtitle ? <p className="store-header__subtitle">{subtitle}</p> : null}
    </div>
    <button className="btn btn-secondary" onClick={onToggleCart}>
      Cart ({cartCount})
    </button>
  </header>
);
