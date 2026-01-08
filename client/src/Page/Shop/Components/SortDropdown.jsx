import { useRef } from "react";
import useClickOutside from "../../../Hook/useClickOutSide";
import styles from "../Shop.module.scss";
import { useSearchParams } from "react-router-dom";

export default function SortDropdown({
  sortType,
  sortOptions,
  openSort,
  setOpenSort,
  setSortType,
  setSearchParams,
  searchParams,
}) {
  const dropDownRef = useRef(null);
  useClickOutside(dropDownRef, () => setOpenSort(false), openSort);

  const mapping = {
    "Best Seller": "bestSeller",
    "Newest": "newest",
    "Low to High": "lowToHigh",
    "High to Low": "highToLow",
  };
  const handleSelectSort = (option) => {
    const allParams = Object.fromEntries(searchParams.entries());
    const optionMapping = mapping[option]
    allParams.sort = optionMapping;
    setSearchParams(allParams);
  };

  return (
    <div className={styles.sortDropdownWrapper} ref={dropDownRef}>
      <label onClick={() => setOpenSort(!openSort)}>
        Sort by: <u>{sortType}</u>
      </label>
      {openSort && (
        <div className={styles.sortDropdown}>
          {sortOptions.map((option, i) => (
            <div
              key={i}
              className={`${styles.sortOption} ${
                sortType === option ? styles.active : ""
              }`}
              onClick={() => {
                setSortType(option);
                setOpenSort(false);
                handleSelectSort(option);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
