import { useEffect, useState, useRef } from "react";
import { Filter, Sort } from "../../Assets";
import styles from "./Shop.module.scss";
import SortDropdown from "./Components/SortDropdown.jsx";
import FilterPopup from "./Components/FilterPopup";
import ProductCard from "../../Components/ProductCard";
import { useLocation, useSearchParams } from "react-router-dom";
import useProducts from "../../Hook/useProduct.js";
import Pagination from "../../Components/Pagination/index.jsx";

export default function Shop() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortType, setSortType] = useState("Best Seller");
  const [openSort, setOpenSort] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const [options, setOptions] = useState({});
  const [filter, setFilter] = useState({});

  const [currentIndex, setCurrentIndex] = useState(1);
  const filterOption = ["Category", "Price"];
  const sortOptions = ["Best Seller", "Newest", "Low to High", "High to Low"];

  // URL-based values
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");

  // detect tag from route
  const segments = location.pathname.split("/");
  let tag = "";
  if (segments.includes("new_arrival")) tag = "tag/new_arrival";
  if (segments.includes("sale")) tag = "tag/sale";

  const { items, loadPage, meta, totalPage } = useProducts({
    category,
    minPrice,
    maxPrice,
    sort,
    tag,
  });

  // fetch categories
  // TODO (line ~60): replace inline `fetch("http://localhost:5000/category")`
  // with a centralized API helper (`client/src/Api/productApi.js`) and base URL.
  useEffect(() => {
    fetch("http://localhost:5000/category")
      .then((res) => res.json())
      .then((data) => setOptions({ category: data }));
  }, []);



  // restore filter UI from URL
  useEffect(() => {
    const newFilter = {};
    if (category) newFilter.category = category.split(",");
    if (minPrice) newFilter.minPrice = minPrice;
    if (maxPrice) newFilter.maxPrice = maxPrice;
    setFilter(newFilter);
  }, [category, minPrice, maxPrice]);

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    if (page > meta.totalPage) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", 1);
        return params;
      });
    } 
      setCurrentIndex(page);
      loadPage(true);
  }, [searchParams]);

  return (
    <div className={styles.wrapper}>
      <div className="container">
        {/* HEADER */}
        <div className={styles.shopHeader}>
          <div className={styles.sortSection}>
            <span className={styles.sortIcon}>
              <Sort />
            </span>
            <SortDropdown
              sortType={sortType}
              sortOptions={sortOptions}
              openSort={openSort}
              setOpenSort={setOpenSort}
              setSortType={setSortType}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
            />
          </div>
          <div
            className={styles.filterButton}
            onClick={() => setOpenFilter(true)}
          >
            <p>Filters</p>
            <span className={styles.filterIcon}>
              <Filter />
            </span>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className={styles.products}>
          {items.map((p) => (
            // TODO (line ~101): avoid using array index as `key` — use `p._id` when available
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* PAGINATION */}
        <Pagination
          totalIndex={totalPage}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          arrow
        />

        {/* FILTER POPUP */}
        {openFilter && (
          <FilterPopup
            filterOption={filterOption}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            options={options}
            filter={filter}
            setFilter={setFilter}
            setSearchParams={setSearchParams}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  );
}
