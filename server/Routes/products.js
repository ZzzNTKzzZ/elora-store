import express from "express"
import ProductController from "../controllers/ProductController.js";
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Lưu vào thư mục uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
const router = express.Router();

// /products
router.get("/" , ProductController.products) // Get all products
// /products/bestSeller
router.get("/bestSeller", ProductController.bestSeller) // Get best seller product
// /products/tag
router.get("/tag/:tag", ProductController.productsByTag)
// /products/create
router.get("/create", ProductController.add) // Create new products
// /products/search?q=
router.get("/search", ProductController.search)
// /products/add
router.post("/add", upload.single('image'),ProductController.add) // Add new products
// /products/:slug
router.get("/:slug", ProductController.product) // Get product id
export default router