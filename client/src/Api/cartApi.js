export async function getCart(cartId) {
  const res = await fetch(`http://localhost:5000/cart/${cartId}`);

  if (!res.ok) throw new Error("Failed to get cart ");
  return res.json(); // expected: { cart: { _id, items: [...] } }
}

export async function addItemToCart(cartId, { productId, variants, quantity }) {
  const payload = { productId, variants, quantity };
  const res = await fetch(`http://localhost:5000/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add item to cart ");
  return res.json(); // expected { items:[...] }
}

export async function deleteItemFromCart(cartId, { productId, variants }) {
  const payload = { productId, variants}
  const res = await fetch(`http://localhost:5000/cart/${cartId}/items`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( payload ),
  });

  if (!res.ok) throw new Error("Failed to delete item from cart");
  return res.json(); // expected { cart : { _id , items: [...] } }
}

export async function updateItemFromCart(cartId, { productId, variants, oldVariants, quantity } ) {
  const payload = { productId ,variants, oldVariants, quantity };
  const res = await fetch(`http://localhost:5000/cart/${cartId}/items`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( payload ),
  });
  if(!res.ok) throw new Error(" Failed to update item from cart")
    return res.json() // expected {cart : items: [ ... ]}
}