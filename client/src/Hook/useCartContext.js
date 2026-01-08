import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./useUserContext";
import * as cartApi from "../Api/cartApi";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, setUser } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const cartId = user.cart?._id;
  useEffect(() => {
    const cartItemsData = user.cart?.items || [];
    setCartItems(cartItemsData);
  }, [user]);

 const updateCart = async (product, select = {}, quantity, oldVariants) => {
  // UI update
  setCartItems((prev) => {
    return prev.map((item) => {
      const sameProduct =
        item._id === product._id &&
        JSON.stringify(item.variants) === JSON.stringify(oldVariants);

      if (sameProduct) {
        return {
          ...item,
          variants: select,
          quantity: quantity,
        };
      }

      return item;
    });
  });

  // Server update
  const payload = {
    productId: product.product._id,
    variants: select,
    oldVariants: oldVariants,
    quantity,
  };

  const data = await cartApi.updateItemFromCart(cartId, payload);

  setCartItems(data.items);
  setUser((prev) => ({
    ...prev,
    cart: { ...prev.cart, items: data.items },
  }));
};
  const addToCart = async (product) => {
    // Add new product in ui
    const existing = cartItems.find(
      (item) =>
        item._id === product._id &&
        JSON.stringify(item.variants) === JSON.stringify(product.variants)
    );

    setCartItems((prev) => {
      if (existing) {
        return prev.map((item) =>
          item._id === product._id &&
          JSON.stringify(item.variants) === JSON.stringify(product.variants)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [product, ...prev];
    });

    // Add new product in backend
    const payload = {
      productId: product._id,
      variants: product.variants,
      quantity: product.quantity ?? 1,
    };
    const data = await cartApi.addItemToCart(cartId, payload);
    console.log(cartId, payload)
    setCartItems(data.items);
    // Update user cart 
    setUser((prev) => ({
      ...prev,
      cart: { ...prev.cart, items: data.items },
    }));
  };

  const removeFromCart = async (product) => {
    // 1. Update UI immediately
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item._id === product._id &&
            JSON.stringify(item.variants) === JSON.stringify(product.variants)
          )
      )
    );
      const payload =  {
        productId: product.product._id,
        variants: product.variants,
      }
      const data = await cartApi.deleteItemFromCart(cartId, payload);
      setUser((prev) => ({
        ...prev,
        cart: {...prev.cart, items: data.items },
      }));
      return data;
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems?.length;
  const value = {
    cartItems,
    setCartItems,
    updateCart,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
