import Category from "../Model/Category.js";
import Product from "../Model/Product.js";
import TagController from "./TagController.js";

const MAX_LIMIT = 100;

export default class ProductController {
  // GET: /products
  static async products(req, res) {
    try {
      let { category, page = 1, minPrice, maxPrice, sort, limit = 20 } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      limit = Math.min(limit, MAX_LIMIT);
      const sortMap = {
        newest: { createdAt: -1 },
        lowToHigh: { price: 1 },
        highToLow: { price: -1 },
        bestSeller: { sold: -1 },
      };
      const filter = {};
      const sortType = {};

      if (sort && sortMap[sort]) Object.assign(sortType, sortMap[sort]);

      // validate numeric filters
      if (minPrice) minPrice = Number(minPrice);
      if (maxPrice) maxPrice = Number(maxPrice);

      if (category) {
        const names = category.split(",").map(decodeURIComponent);
        const categories = await Category.find({ name: { $in: names } });
        filter.category = categories.map((c) => c._id);
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice !== undefined && !Number.isNaN(minPrice)) filter.price.$gte = minPrice;
        if (maxPrice !== undefined && !Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
      }

   
      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortType)
          .populate("tags", "name")
          .skip((page - 1) * limit)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const meta = {
        total,
        totalPages,
        page,
        limit,
        hasMore: products.length === limit,
      };

      res.json({ data: ProductController.formatProducts(products), meta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // GET: /bestSeller
  static async bestSeller(req, res) {
    try {
      const products = await Product.find().sort({ sold: -1 }).limit(5);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // GET: /products/:tag
  static async productsByTag(req, res) {
    try {
      const flagMap = {
        sale: "isOnSale",
        new_arrival: "isNew",
      };

      const field = flagMap[req.params.tag];
      if (!field) return res.status(400).json({ message: "Invalid tag" });

      const products = await Product.find({ [field]: true }).populate(
        "tags",
        "name"
      );

      res.json(ProductController.formatProducts(products));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // GET: /products/:slug
  static async product(req, res) {
    try {
      const product = await Product.findOne({ slug: req.params.slug }).populate(
        [
          { path: "category", select: "name" },
          { path: "tags", select: "name" },
          { path: "reviews", select: "user comment rating" },
        ]
      );

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      res.json({
        ...product.toObject(),
        price: product.price,
        sale: product.salePrice || null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // GET: /products/search?q=?
  static async search(req, res) {
    try {
      const { q, limit = 20, mode = "prefix" } = req.query;
      if (!q) return res.status(400).json({ message: "Missing query" });

      const cappedLimit = Math.min(Number(limit) || 20, 50);

      let filter = {};

      // If q looks like a 24-char hex ObjectId, allow id match
      if (/^[0-9a-fA-F]{24}$/.test(q)) {
        filter._id = q;
      } else {
        // name search: prefix or substring depending on `mode`
        const safeQ = q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
        if (mode === "substring") {
          filter.name = { $regex: safeQ, $options: "i" };
        } else {
          // default: prefix
          filter.name = { $regex: `^${safeQ}`, $options: "i" };
        }
      }

      const products = await Product.find(filter).limit(cappedLimit).populate("tags", "name");
      res.json(ProductController.formatProducts(products));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // POST: /products/add
  static async add(req, res) {
    try {
      // normalize incoming form fields
      const { name, price, salePrice, des, tags, category, stock, isNew } =
        req.body;

      const image =
        req.file && req.file.filename
          ? `/uploads/products/${req.file.filename}`
          : null;
      let tagIds = [];
      if (tags) {
        const names = tags.split(",").map((t) => t.trim());
        tagIds = await Promise.all(names.map(TagController.add));
      }

      // ensure numeric fields are parsed
      const parsedPrice = price ? Number(price) : 0;
      const parsedSale = salePrice ? Number(salePrice) : null;
      const parsedStock = stock ? Number(stock) : 0;
      const parsedIsNew = isNew === "true" || isNew === true || isNew === "on";

      const product = await Product.create({
        name,
        price: parsedPrice,
        salePrice: parsedSale,
        des,
        tags: tagIds,
        image,
        category: category || null,
        stock: parsedStock,
        isNew: parsedIsNew,
      });

      res.status(201).json({ message: "Product created", product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async categories(req, res) {
    try {
      const { cate, minPrice, maxPrice } = req.query;
      const filter = {};

      if (cate) filter.name = decodeURIComponent(cate);

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const categories = await Category.find(filter);
      if (!categories.length)
        return res.status(404).json({ message: "No categories found" });

      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // PUT : products/edit/:id
  static async edit(req, res) {
    try {
      const { id } = req.params;
      const { name, price, salePrice, des, tags, category, stock, isNew } =
        req.body;
      const product = await Product.findByIdAndDelete(
        id,
        {
          name,
          price,
          salePrice,
          des,
          tags,
          category,
          stock,
          isNew,
        },
        { new: true }
      );


      await product.save();

      res.status(201).json({ message: "Modify success", product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static formatProducts(products) {
    return products.map((p) => ({
      ...p.toObject(),
      price: p.price,
      sale: p.salePrice || null,
      tags: p.tags?.map((t) => t.name),
    }));
  }
}
