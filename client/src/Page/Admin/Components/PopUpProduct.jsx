import { useEffect, useRef, useState } from "react";
import styles from "./componentAdmin.module.scss";
import { createProduct } from "../../../Api/productApi";
import useClickOutside from "../../../Hook/useClickOutSide";
import Button from "../../../Components/Button";
export default function PopUpPorudct({ open, setOpen, product }) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    price: product.price || "",
    salePrice: product.salePrice || "",
    des: product.des || "",
    tags: product.tags || "",
    category: product.categories || "",
    stock: product.stock || "",
    isNew: product.isNew || false,
    image: product.image || null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const popUpRef = useRef(null);

  useClickOutside(popUpRef, () => setOpen(false), open);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/category");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories: ", error);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.name || !formData.price || !formData.image) {
      setError("Name, Price and Image are required");
      return;
    }
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("salePrice", formData.salePrice || "");
      data.append("des", formData.des);
      data.append("tags", formData.tags);
      data.append("category", formData.category);
      data.append("isNew", formData.isNew);
      data.append("image", formData.image);
      console.log("click")
      const result = await createProduct(data);
      setSuccess("Product created successfully");
      setFormData({
        name: "",
        price: "",
        salePrice: "",
        des: "",
        tags: "",
        category: "",
        stock: "",
        isNew: false,
        image: null,
      });
    } catch (error) {
      setError(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div className={styles.popUpOverLay}>
      <div className={styles.popUpCreateProduct} ref={popUpRef}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.tableInfo}>
            {/* Name */}
            <div className={styles.name}>
              <label>Product Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price */}
            <div className={styles.price}>
              <label>Price:</label>
              <input
                type="number"
                name="price"
                placeholder="100000"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* Sale Price */}
            <div className={styles.salePrice}>
              <label>Sale Price:</label>
              <input
                type="number"
                name="salePrice"
                placeholder="80000"
                value={formData.salePrice}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className={styles.category}>
              <label>Category:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className={styles.tags}>
              <label>Tags (comma-separated):</label>
              <input
                type="text"
                name="tags"
                placeholder="summer, clearance, new"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Stock */}
            <div className={styles.stock}>
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                placeholder="10"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>

            {/* Is New */}
            <div className={styles.isNew}>
              <label>
                <input
                  className="checkboxInput white"
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                />
                Mark as New Arrival
              </label>
            </div>

            {/* Image */}
            <div className={styles.image}>
              <label>Image:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                // required
              />
              {formData.image && <label>Selected: {formData.image.name}</label>}
            </div>

            {/* Description */}
            <div className={styles.description}>
              <label>Description:</label>
              <textarea
                name="des"
                placeholder="Product description"
                value={formData.des}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <Button className={styles.createBtn} type={2} disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </div>
    </div>
  );
}
