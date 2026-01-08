import Cart from "../Model/Cart.js";
import mongoose from "mongoose";

export default class CartController {
  // ========================
  // GET: /:cartId
  // ========================
  static async cart(req, res) {
    try {
      const { cartId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ mess: "Invalid cart id" });
      }

      const cart = await Cart.findById(cartId).populate("items.product");

      if (!cart) {
        return res.status(404).json({ mess: "Cart not found" });
      }

      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ mess: "Server error" });
    }
  }

  // ========================
  // POST: /:cartId/items
  // ========================
  static async addItemOnCart(req, res) {
    try {
      const { cartId } = req.params;
      const { productId, quantity = 1, variants = {} } = req.body;
      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({ mess: "Invalid id" });
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return res.status(404).json({ mess: "Cart not found" });
      }

      const existing = cart.items.find(
        (i) =>
          i.product.toString() === productId &&
          i.variants?.color === variants?.color &&
          i.variants?.size === variants?.size
      );

      let updatedCart;

      if (existing) {
        updatedCart = await Cart.findOneAndUpdate(
          {
            _id: cartId,
            "items.product": productId,
            "items.variants.color": variants?.color,
            "items.variants.size": variants?.size,
          },
          {
            $inc: { "items.$.quantity": quantity },
          },
          { new: true }
        );
      } else {
        updatedCart = await Cart.findByIdAndUpdate(
          cartId,
          {
            $push: {
              items: {
                product: productId,
                quantity,
                variants,
              },
            },
          },
          { new: true }
        );
      }

      res.json(await updatedCart.populate("items.product"));
    } catch (error) {
      console.log(error);
      res.status(500).json({ mess: "Server error" });
    }
  }

  // ========================
  // DELETE: /:cartId/items
  // ========================
  static async deleteItemOnCart(req, res) {
    try {
      const { cartId } = req.params;
      const { productId, variants = {} } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({ mess: "Invalid id" });
      }

      const itemMatch = {
        product: productId,
      };

      if (variants.color) itemMatch["variants.color"] = variants.color;
      if (variants.size) itemMatch["variants.size"] = variants.size;

      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cartId },
        {
          $pull: {
            items: itemMatch,
          },
        },
        { new: true }
      ).populate("items.product");

      if (!updatedCart) {
        return res.status(404).json({ mess: "Cart not found" });
      }

      res.json(updatedCart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ mess: "Server error" });
    }
  }

  // ========================
  // PATCH: /:cartId/items
  // ========================
  static async updateItemOnCart(req, res) {
    try {
      const { cartId } = req.params;
      const { productId, variants = {}, oldVariants = {}, quantity } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({ mess: "Invalid id" });
      }

      if (quantity < 1) {
        return res.status(400).json({ mess: "Quantity must be at least 1" });
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cartId },
        {
          $set: {
            "items.$[item].quantity": quantity,
            "items.$[item].variants": variants,
          },
        },
        {
          new: true,
          arrayFilters: [
            {
              "item.product": new mongoose.Types.ObjectId(productId),
              ...(oldVariants.size && {
                "item.variants.size": oldVariants.size,
              }),
              ...(oldVariants.color && {
                "item.variants.color": oldVariants.color,
              }),
            },
          ],
        }
      ).populate("items.product");

      if (!updatedCart) {
        return res.status(404).json({ mess: "Item not found in cart" });
      }

      res.json(updatedCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mess: "Server error" });
    }
  }
}
