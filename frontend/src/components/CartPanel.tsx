import type { Pet } from '../types/pet';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: Pet[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
}

export const CartPanel = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onCheckout,
  isProcessing,
}: CartPanelProps) => (
  <div className={`cart-panel ${isOpen ? 'cart-panel--open' : ''}`}>
    <div className="cart-panel__header">
      <h2>Your cart</h2>
      <button className="icon-button" onClick={onClose} aria-label="Close cart">
        ✕
      </button>
    </div>
    <div className="cart-panel__body">
      {items.length === 0 ? (
        <p className="cart-panel__empty">Your cart is empty.</p>
      ) : (
        <ul className="cart-panel__list">
          {items.map((pet) => (
            <li key={pet.id} className="cart-panel__item">
              <div>
                <strong>{pet.name}</strong>
                <p>{pet.description}</p>
              </div>
              <button className="link-button" onClick={() => onRemove(pet.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="cart-panel__footer">
      <button
        className="btn btn-primary"
        onClick={onCheckout}
        disabled={items.length === 0 || isProcessing}
      >
        {isProcessing ? 'Processing…' : `Checkout ${items.length} pet${items.length === 1 ? '' : 's'}`}
      </button>
    </div>
  </div>
);
