import type { Pet } from '../types/pet';

interface PetCardProps {
  pet: Pet;
  onAddToCart: (pet: Pet) => void;
  onPurchase: (pet: Pet) => void;
  isPurchasing?: boolean;
}

export const PetCard = ({
  pet,
  onAddToCart,
  onPurchase,
  isPurchasing = false,
}: PetCardProps) => (
  <article className="pet-card">
    <div className="pet-card__image-wrapper">
      <img src={`/${pet.imagePath}`} alt={pet.name} className="pet-card__image" />
    </div>
    <div className="pet-card__content">
      <header className="pet-card__header">
        <h3>{pet.name}</h3>
        <span className="pet-card__badge">{pet.species.toLowerCase()}</span>
      </header>
      <p className="pet-card__meta">{`${pet.ageYears} human years`}</p>
      <p className="pet-card__description">{pet.description}</p>
    </div>
    <footer className="pet-card__actions">
      <button
        className="btn btn-primary"
        onClick={() => onPurchase(pet)}
        disabled={isPurchasing}
      >
        {isPurchasing ? 'Purchasing…' : 'Purchase now'}
      </button>
      <button className="btn btn-secondary" onClick={() => onAddToCart(pet)}>
        Add to cart
      </button>
    </footer>
  </article>
);
