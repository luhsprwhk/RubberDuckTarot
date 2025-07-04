import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCards from '../lib/cards/useCards';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { Search } from 'lucide-react';
import Footer from '../components/Footer';

const Cards = () => {
  const { cards, loading, error } = useCards();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <Loading text="Loading cards..." />;
  if (error) return <ErrorState error={error} />;

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.core_meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const createCardSlug = (cardName: string) => {
    return cardName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-void-gradient min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">
          Card Library
        </h1>
        <p className="text-secondary text-center mb-6 max-w-2xl mx-auto">
          Explore all the cards in Rob's ethereal deck. Each card offers unique
          insights for debugging life's challenges.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search cards by name, meaning, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-liminal-border rounded-lg text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <Link
            key={card.id}
            to={`/cards/${createCardSlug(card.name)}`}
            className="group"
          >
            <div className="bg-surface rounded-xl border border-liminal-border p-6 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group-hover:scale-105">
              {/* Card Emoji */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{card.emoji}</div>
                <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                  {card.name}
                </h3>
              </div>

              {/* Core Meaning */}
              <p className="text-secondary text-sm mb-4 line-clamp-3">
                {card.core_meaning}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {card.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {card.tags.length > 3 && (
                  <span className="px-2 py-1 bg-muted/20 text-muted text-xs rounded-full">
                    +{card.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No cards found
          </h3>
          <p className="text-secondary">
            Try a different search term or browse all cards.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-accent text-void-900 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Total Count */}
      <div className="text-center mt-8 text-muted">
        {searchTerm ? (
          <p>
            Showing {filteredCards.length} of {cards.length} cards
          </p>
        ) : (
          <p>{cards.length} cards in the ethereal deck</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cards;
