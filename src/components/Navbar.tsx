import React, { useState } from 'react';
import { Product } from '../types';

interface NavbarProps {
  onSearch: (term: string) => void;
  onSort: (order: string) => void;
  likedItems: Product[];
  onRemoveLikedItem: (id: number) => void;
}

const Navbar = ({ onSearch, onSort, likedItems, onRemoveLikedItem }: NavbarProps) => {
  const [showLikedItems, setShowLikedItems] = useState(false);
  const [searchCache, setSearchCache] = useState<{ [key: string]: Product[] }>({});

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // class use
  // Debounced for the search handler
  const debouncedSearch = debounce((value: string) => {
    if (searchCache[value]) {
      // If the search term is in the cache, use cached results
      onSearch(value);
    } else {
      // Otherwise, make a new search request and update the cache
      fetch(`https://dummyjson.com/products?search=${value}`)
        .then(response => response.json())
        .then(data => {
          setSearchCache(prevCache => ({
            ...prevCache,
            [value]: data.products
          }));
          onSearch(value);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, 500);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    debouncedSearch(value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSort(event.target.value);
  };

  const toggleLikedItems = () => {
    setShowLikedItems(!showLikedItems);
  };

  return (
    <nav>
      <input
        type="text"
        placeholder="Search products..."
        onChange={handleSearchChange}
      />
      <div>
      <span>Sort by title: </span>
      <select onChange={handleSortChange}>

        {/* <option value="normal">Sort by</option> */}
        {/* <option value="normal">Normal</option>
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option> */}

        // fix 2: this issue here
        
        {['Normal', 'Ascending', 'Descending'].map((option, index) => (
          <option key={index} value={option.toLowerCase()}>
            {option}
          </option> 
        ))}
      </select>
      </div>
      <button onClick={toggleLikedItems}>
        ❤️ Likes ({likedItems.length})
      </button>
      {showLikedItems && (
        <div className="liked-items-box">
          <ul>
            {likedItems.map((item, ind) => (
              <li key={`${item.id}-${ind.toString()}`}>
                {item.title}
                <button onClick={() => onRemoveLikedItem(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
