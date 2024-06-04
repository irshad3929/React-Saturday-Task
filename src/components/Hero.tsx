import React, { useEffect, useCallback, useRef } from 'react';
import { Product } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

interface HeroProps {
  data: Product[];
  fetchData: (page: number) => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  hasMore: boolean;
  onLikeToggle: (id: number) => void;
  likedItems: number[];
  cache: { [key: number]: Product[] }; // Record<number, Product[]>
  setCache: (cache: { [key: number]: Product[] }) => void; // same as above
  searchTerm: string; // Add searchTerm prop
}

const Hero = ({data,fetchData,currentPage,setCurrentPage,hasMore,onLikeToggle,likedItems,cache,setCache,searchTerm}: HeroProps) => {
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Throttle function
  const throttle = (func: Function, limit: number) => {
    let lastFunc: ReturnType<typeof setTimeout>;  // A reference to the most recent setTimeout function call
    let lastRan: number;    // A timestamp to the last time the function was called
    return (...args: any[]) => {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);  // for avoid duplicate calls
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  const throttledFetchData = useCallback(
    throttle((page: number) => {
      // Check if data exists in cache
      if (cache[page]) {
        setCurrentPage(page);
        return;
      }
      fetchData(page).then(() => {
        setCache({
          ...cache,
          [page]: data // Store fetched data in cache
        });
      });
    }, 3000),
    [fetchData, cache, setCache, data]
  );

  const handleScroll = useCallback(() => {
    if (searchTerm) return; // Prevent automatic pagination if search term is active
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const { scrollTop, scrollHeight, clientHeight } = heroElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
      setCurrentPage(currentPage + 1);
      throttledFetchData(currentPage + 1);
    }
  }, [currentPage, throttledFetchData, hasMore, setCurrentPage, searchTerm]);

  // make custome hook to addListner and removeListner
  useEffect(() => {
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (heroElement) {
        heroElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <div className="hero" ref={heroRef} style={{ overflowY: 'auto', maxHeight: '80vh' }}>
      <div className="card-container">
        {data.map((product, ind) => (
          <div className="card" key={`${product.id}-${ind.toString()}`}>
            <img src={product.thumbnail} alt={product.title} />
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <button className="like-button" onClick={() => onLikeToggle(product.id)}>
              <FontAwesomeIcon icon={likedItems.includes(product.id) ? solidHeart : regularHeart} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
