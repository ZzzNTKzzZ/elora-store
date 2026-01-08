import { useEffect, useState } from "react";
import { Eyes, Pen, Trash } from "../../Assets";
import Button from "../../Components/Button";
import Pagination from "../../Components/Pagination";
import styles from "./Admin.module.scss";
import Breadcrumb from "../../Components/BreadCrumb";
import useProducts from "../../Hook/useProduct";
import { searchProduct } from "../../Api/productApi";
import { useSearchParams } from "react-router-dom";
import PopUpProduct from "./Components/PopUpProduct";
import InputSearch from "../../Components/InputSearch";

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");
  let tag = "";
  const { items, loadPage, loading, error, meta, totalPage } = useProducts({
    category,
    minPrice,
    maxPrice,
    sort,
    tag,
    limit: 10,
  });
  const [currentIndex, setCurrentIndex] = useState(() => Number(searchParams.get("page")) || 1);
  const [popUpProduct, setPopUpProduct] = useState(false);
  const [productDetail, setProductDetail] = useState({});

  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handlePopup = () => {
    setPopUpProduct(true);
  };

  const handleEdit = (product) => {
    setProductDetail(product)
    setPopUpProduct(true);
  };

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    if (page > (meta.totalPages || totalPage)) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", 1);
        return params;
      });
    } else {
      setCurrentIndex(page);
      loadPage(true);
    }
    
  }, [searchParams]);
  useEffect(() => {
    const controller = new AbortController();
    let t = null;

    if (!query) {
      setSearchItems([]);
      setSearching(false);
      setSearchError("");
    } else {
      setSearching(true);
      setSearchError("");
      t = setTimeout(async () => {
        try {
          const data = await searchProduct(query);
          setSearchItems(data || []);
          setSearchError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setSearchError("Failed to search products");
            setSearchItems([]);
          }
        } finally {
          setSearching(false);
        }
      }, 300);
    }

    return () => {
      if (t) clearTimeout(t);
      controller.abort();
    };
  }, [query])

  return (
    <div className={styles.productWrapper}>
      <div className={styles.header}>
        <h2>Product List</h2>
        <Breadcrumb />
      </div>
      <div className={`${styles.tableStatistics} ${styles.product}`}>
        <div className={styles.note}>
          Tip search by Product ID: Each product is provided with a unique ID,
          which you can rely on to find the exact product you need.
        </div>
        <span className={styles.groupAction}>
          <InputSearch onChange={setQuery} placeholder={"Search by Product name or ID"} className={styles.search} />
          <Button className={styles.add} onClick={handlePopup}>
            + Add new
          </Button>
        </span>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>Product</div>
            <div>Product Id</div>
            <div>Price</div>
            <div>Sold</div>
            <div>Sale</div>
            <div>Action</div>
          </div>

          <div className={styles.tableBody}>
            {query ? (
              <>
                {searching && <div style={{ padding: "20px", textAlign: "center" }}>Searching...</div>}
                {searchError && <div style={{ padding: "20px", color: "red" }}>⚠ {searchError}</div>}
                {!searching && searchItems.length === 0 && !searchError && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No products found</div>
                )}
                {searchItems.map((product) => (
                  <div className={styles.tableRow} key={product._id}>
                    <div className={styles.info}>
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt="alt image"
                      />
                      <p className={styles.name}>{product.name}</p>
                    </div>
                    <div>{product._id.slice(12)}</div>
                    <div>
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div>{product.sold || 0}</div>
                    <div>
                      {((product.sold || 0) * product.price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div className={styles.action}>
                      <span><Eyes /></span>
                      <span onClick={() => handleEdit(product)}><Pen /></span>
                      <span><Trash /></span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {loading && <div style={{ padding: "20px", textAlign: "center" }}>Loading products...</div>}
                {!loading && items.length === 0 && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No products available</div>
                )}
                {items.map((product) => (
                  <div className={styles.tableRow} key={product._id}>
                    <div className={styles.info}>
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt="alt image"
                      />
                      <p className={styles.name}>{product.name}</p>
                    </div>
                    <div>{product._id.slice(12)}</div>
                    <div>
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div>{product.sold}</div>
                    <div>
                      {(product.sold * product.price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div className={styles.action}>
                      <span onClick={() => handleEdit(product)}><Pen /></span>
                      <span><Trash /></span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {!query && (
            <Pagination
              totalIndex={totalPage}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              arrow
            />
          )}
        </div>
      </div>
      {popUpProduct && (
        <PopUpProduct
          open={popUpProduct}
          setOpen={setPopUpProduct}
          product={productDetail}
        />
      )}
    </div>
  );
}
