import styles from "./Cart.module.scss";

export default function CartItem({ item }) {
  return (
    <div className={styles.CartItemWrapper}>
      <div className={styles.left}>
        <img src={`http://localhost:5000${item.product.image}`} alt="" />
        {item.product.name}
      </div>
      <div className={styles.right}>
        {item.product.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
      </div>
    </div>
  );
}
