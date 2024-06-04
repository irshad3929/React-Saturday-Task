import React, { useEffect } from "react";

interface FooterProps {
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
  onOffsetChange: (newOffset: number) => void;
  offset: number;
  totalPages: number;
  currentPage: number;
  resetPage: boolean; // New prop to indicate whether to reset the current page
}

const Footer = ({
  onPrev,
  onNext,
  onPageSelect,
  onOffsetChange,
  offset,
  totalPages,
  currentPage,
  resetPage,
}: FooterProps) => {
  useEffect(() => {
    if (resetPage) {
      onPageSelect(1); // Reset the page to 1 when the resetPage flag is true
    }
    //onPageSelect(currentPage);
  }, [resetPage, onPageSelect]);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <footer>
      <button onClick={onPrev} disabled={currentPage === 1}>
        Prev
      </button>
      <div className="page-buttons">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageSelect(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}{" "}
      </div>
      <button onClick={onNext} disabled={currentPage === totalPages}>
        Next
      </button>
      <div>
        <span>Items per page:</span>
        <select
          onChange={(e) => onOffsetChange(Number(e.target.value))}
          value={offset}
        >
          {/* [10,20,60,80].map((i)=><option value=i/>) */}
          {/* <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option> */}
         
         // fix 1 : this issue here
          {[10, 20, 50,60].map((i) => (
            <option value={i} key={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
    </footer>
  );
};

export default Footer;
