import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductDetail.module.scss";
import { useCart } from "../../Hook/useCartContext";
import { useCheckOut } from "../../Hook/useCheckOutContext";
import { useUser } from "../../Hook/useUserContext";
import * as productApi from "../../Api/productApi";


import Button from "../../Components/Button";
import QuantitySelector from "./Quantity";
import Rating from "../../Components/Rating";
import ProductList from "../../Components/ProductList";
import Breadcrumb from "../../Components/BreadCrumb";

export default function ProductDetail() {
  const { isUserEmpty } = useUser();
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { setCheckOutItems } = useCheckOut();

  // === State ===
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({});
  const [validSelected, setValidSelected] = useState(true);

  // === Fetch product ===
  useEffect(() => {
    const fetchData = async () => {
      const data = await productApi.getProductDetail(slug); // Get product Detail by slug
      setProduct(data)
      setLoading(false);
    }
    fetchData()
  }, [slug]);

  // === Init selected variations ===
  useEffect(() => {
    if (!product?.variations) return;

    const initial = Object.keys(product.variations).reduce((acc, key) => {
      acc[toSingular(key)] = "";
      return acc;
    }, {});

    setSelected(initial);
  }, [product]);


  // Helper
  const toSingular = (key) =>
    key.endsWith("s") ? key.slice(0, -1) : key;

  const validateSelection = () => {
    const valid = Object.values(selected).every(Boolean);
    setValidSelected(valid);
    return valid;
  };

  const requireLogin = () => {
    if (isUserEmpty()) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const buildItemPayload = () => ({
    ...product,
    quantity,
    variations: product.variations,
    variants: selected,
  });

  const buildCheckoutItemPayload = () => ({
  product,
  quantity,
  variations: product.variations,
  variants: selected,
});

  // Handler
  const handleSelect = (key, value) => {
    setValidSelected(true);
    setSelected((prev) => ({
      ...prev,
      [toSingular(key)]: value,
    }));
  };

  const handleAddToCart = () => {
    if (requireLogin()) return;
    if (!validateSelection() || !product) return;
    addToCart(buildItemPayload());
  };

  const handleBuyNow = () => {
    if (requireLogin()) return;
    if (!validateSelection() || !product) return;
    
    setCheckOutItems([buildCheckoutItemPayload()]);
    navigate("/checkout");
  };

  // Derived 
  const variationKeys = useMemo(
    () => Object.keys(product?.variations || {}),
    [product]
  );

  //  States 
  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;


  // === Render (UNCHANGED) ===
  return (
    <div className={`container ${styles.wrapper}`}>
      <Breadcrumb currentPath={product.name} />

      <section className={styles.productSection}>
        <div className={`${styles.gallery} col-5`}>
          <div className={styles.mainImage}>
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
            />
          </div>
        </div>

        <div className={`${styles.info} col-7`}>
          <h3 className={styles.name}>{product.name}</h3>

          <div className={styles.stats}>
            <Rating rating={product.rating} />
            <span className={styles.divider}></span>
            <span>
              <p className={styles.label}>Reviews</p>{" "}
              {product.reviews?.length || 0}
            </span>
            <span className={styles.divider}></span>
            <span>
              <p className={styles.label}>Sold</p> {product.sold}
            </span>
          </div>

          <p className={styles.price}>
            {product.isOnSale ? (
              <span className={styles.sale}>
                <span className={styles.price}>
                  {product.sale.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                <span className={styles.oldPrice}>
                  {product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              </span>
            ) : (
              <span className={styles.price}>
                {product.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            )}
          </p>

          <div
            className={`${styles.variationsGroup} ${
              !validSelected ? styles.error : ""
            }`}
          >
            {variationKeys.map((key) => {
              const singular = toSingular(key);
              return (
                <div key={key} className={styles.variations}>
                  <p className={styles.variationsLabel}>
                    {singular.charAt(0).toUpperCase() + singular.slice(1)}
                  </p>
                  {product.variations[key].map((value) => (
                    <Button
                      key={value}
                      type={2}
                      className={styles.variationBtn}
                      active={selected[singular] === value}
                      onClick={() => handleSelect(key, value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              );
            })}
          </div>

          <div className={styles.quantityGroup}>
            <p className={styles.quantityLabel}>Quantity</p>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            <div className={styles.stockText}>
              In stock: {product.stock}
            </div>
          </div>

          {!validSelected && (
            <span className={styles.errorMessage}>
              Please select Product Category{" "}
            </span>
          )}

          <div className={styles.actions}>
            <Button onClick={handleAddToCart} className={styles.addBtn}>
              Add To Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              type={2}
              className={styles.buyBtn}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <h2>Product Detail</h2>
        <div className={styles.detailList}>
          <Detail
            label="Category"
            value={product.category?.name || "Uncategorized"}
          />
          <Detail label="Stock" value={product.stock} />
          <Detail
            label="Tags"
            value={product.tags?.map((t) => t.name).join(", ") || "None"}
          />
        </div>

        <h2>Description</h2>
        <div className={styles.description}>{product.des}</div>
      </section>

      <ProductList />
{/* 
      {product.reviews?.length > 0 && (
        <section className={styles.reviews}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviewList}>
            {product.reviews.map((r) => (
              <div key={r._id} className={styles.reviewItem}>
                <Rating rating={r.rating} />
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
}

// === Helper ===
function Detail({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <p>{label}</p>
      <span>{value}</span>
    </div>
  );
}
