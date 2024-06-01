import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import "./App.css";
import { Product } from "./types";

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("normal");
  const [likedItems, setLikedItems] = useState<Product[]>(() => {
    const storedLikedItems = localStorage.getItem("likedItems");
    return storedLikedItems ? JSON.parse(storedLikedItems) : [];
  });
  const [offset, setOffset] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [resetPage, setResetPage] = useState(false);
  const [cache, setCache] = useState<{ [key: number]: Product[] }>({});

  const fetchData = useCallback(async (page: number) => {
    try {
      const response = await fetch(`https://dummyjson.com/products?limit=${offset}&skip=${(page - 1) * offset}`);
      const data = await response.json();
      if (Array.isArray(data.products)) {
        setProducts((prevProducts) =>
          page === 1 ? data.products : [...prevProducts, ...data.products]
        );
        setOriginalProducts((prevProducts) =>
          page === 1 ? data.products : [...prevProducts, ...data.products]
        );
        setTotalPages(Math.ceil(data.total / offset));  // total 194 data
        setHasMore(data.products.length === offset);
      } else {
        console.error("API response does not contain products array");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setHasMore(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("likedItems", JSON.stringify(likedItems));
  }, [likedItems]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setResetPage(true);
  };

  const handleSort = (order: string) => {
    setSortOrder(order);
    setProducts((prev) => {
      if (order === "ascending") {
        return [...prev].sort((a, b) => a.title.localeCompare(b.title));
      } else if (order === "descending") {
        return [...prev].sort((a, b) => b.title.localeCompare(a.title));
      } else if (order === "normal") {
        return [...originalProducts];
      } else {
        return [...prev];
      }
    });
  };

  const handleLikeToggle = useCallback((id: number) => {
    setLikedItems(prevLikedItems => {
      const isLiked = prevLikedItems.find(item => item.id === id);
      if (isLiked) {
        return prevLikedItems.filter(item => item.id !== id);
      } else {
        const likedProduct = products.find(product => product.id === id);
        return likedProduct ? [...prevLikedItems, likedProduct] : prevLikedItems;
      }
    });
  }, [products]);

  const handleRemoveLikedItem = (id: number) => {
    setLikedItems(prevLikedItems => prevLikedItems.filter(item => item.id !== id));
  };

  const handlePrev = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePageSelect = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOffsetChange = useCallback((newOffset: number) => {
    setOffset(newOffset);
    setCurrentPage(1);
  }, []);

  const getUniqueProducts = (products: Product[]) => {
    const uniqueProducts: Product[] = [];
    const seenTitles = new Set<string>();

    for (const product of products) {
      if (!seenTitles.has(product.title)) {
        uniqueProducts.push(product);
        seenTitles.add(product.title);
      }
    }

    return uniqueProducts;
  };

  useEffect(() => {
    const uniqueProducts = getUniqueProducts(products);
    setFilteredProducts(
      uniqueProducts
        .filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          if (sortOrder === "ascending") {
            return a.title.localeCompare(b.title);
          } else if (sortOrder === "descending") {
            return b.title.localeCompare(a.title);
          }
          return 0;
        })
    );
  }, [products, searchTerm, sortOrder]);

  return (
    <div id="root" className="App">
      <Navbar
        onSearch={handleSearch}
        onSort={handleSort}
        likedItems={likedItems}
        onRemoveLikedItem={handleRemoveLikedItem}
      />
      <div className="content">
        <Hero
          data={filteredProducts}
          fetchData={fetchData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          hasMore={hasMore}
          onLikeToggle={handleLikeToggle}
          likedItems={likedItems.map(item => item.id)}
          cache={cache} 
          setCache={setCache} 
        />
      </div>
      <Footer
        onPrev={handlePrev}
        onNext={handleNext}
        onPageSelect={handlePageSelect}
        onOffsetChange={handleOffsetChange}
        offset={offset}
        totalPages={totalPages}
        currentPage={currentPage}
        resetPage={resetPage} // Pass resetPage to Footer

      />
    </div>
  );
};

export default App;

