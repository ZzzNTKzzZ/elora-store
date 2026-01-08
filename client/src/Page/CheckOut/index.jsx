import { useEffect, useState } from "react";
import { Location } from "../../Assets";
import { useCheckOut } from "../../Hook/useCheckOutContext";
import { useUser } from "../../Hook/useUserContext";
import styles from "./CheckOut.module.scss";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";
import { createCheckout } from "../../Api/orderApi";
import { deleteItemFromCart } from "../../Api/cartApi";
import { useCart } from "../../Hook/useCartContext";

/* ================= CHECKOUT ITEM ================= */

function CheckOutItem({ item }) {
  console.log(item)
  const price = item.product.isOnSale
    ? item.product.salePrice
    : item.product.price;

  return (
    <section className={styles.checkoutItem}>
      <div className={styles.product}>
        <div className={styles.image}>
          <img src={`http://localhost:5000${item.product.image}`} alt="" />
        </div>
        <p className={styles.productName}>{item.product.name}</p>
      </div>

      <div className={styles.variants}>
        {Object.values(item.variants).join(", ")}
      </div>

      <div className={styles.price}>
        {price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
      </div>

      <div className={styles.quantity}>{item.quantity}</div>

      <div className={styles.amount}>
        {(price * item.quantity).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
      </div>
    </section>
  );
}


export default function CheckOut() {
  const paymentMethods = ["Cash on Delivery", "E-wallet"];
  const { checkoutItems, setCheckOutItems } = useCheckOut();
  const { user, setUser } = useUser();
  const { removeFromCart } = useCart();
  const navigate = useNavigate();
  const defaultAddress = user?.address?.find((addr) => addr.isDefault);
  const [loading, setLoading] = useState(true);
  const [paymentMethod] = useState(paymentMethods[0]);

  const totalPrice = checkoutItems.reduce(
    (prev, cur) =>
      prev +
      (cur.product.isOnSale ? cur.product.salePrice : cur.product.price) *
        cur.quantity,
    0
  );

  const totalShippingFee = 0;
  const totalPayment = totalPrice + totalShippingFee;

  const handleCheckOut = async () => {
    try {
      if (!checkoutItems || checkoutItems.length === 0) {
        console.warn("No items to checkout");
        return;
      }

      const orderItems = checkoutItems.map((item) => {
        removeFromCart(item);
        const price = item.product.isOnSale
          ? item.product.salePrice
          : item.product.price;
        return {
          product: item.product._id,
          quantity: item.quantity,
          variants: item.variants,
          price: price,
        };
      });

      await createCheckout(user._id, orderItems);
      navigate("/account/order");
      setCheckOutItems([]);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [checkoutItems]);

  if (loading) return <div>Loadding.</div>;
  if(!defaultAddress) {
    alert("Need address")
    navigate("http://localhost:3000/account/address")
  }
  if(!user.phone) {
    alert("Need phone number")
    navigate("http://localhost:3000/account/profile")
  }


  return (
    <div className={styles.wrapper}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.icon}>
              <Location />
            </span>
            <h2>Delivery Address</h2>
            {defaultAddress ? (
              <p>
                {defaultAddress.city}, {defaultAddress.ward}
              </p>
            ) : (
              <p>No default address</p>
            )}
          </div>

          <div className={styles.infoUser}>
            <div className={styles.name}>{user.name}</div>
            <div className={styles.phone}>({user.phone})</div>
            <div className={styles.address}>{user.location}</div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.list}>
            <div className={styles.product}>Products</div>
            <div className={styles.price}>Price</div>
            <div className={styles.quantity}>Quantity</div>
            <div className={styles.amount}>Amount</div>
          </div>

          <div className={styles.items}>
            {checkoutItems.map((item) => (
              <CheckOutItem
                item={item}
                key={`${item._id}-${JSON.stringify(item.variants)}`}
              />
            ))}
          </div>

          <span className={styles.line}></span>
        </div>

        <div className={styles.pay}>
          <div className={styles.headerPay}>
            <section className={styles.c1}>
              <h2>Payment method</h2>
            </section>

            <section className={styles.paymentMethod}>
              <p>{paymentMethod}</p>
            </section>

            <section className={styles.changePaymentBtn}>
              <button>
                <p>Change</p>
              </button>
            </section>
          </div>

          <span className={styles.line}></span>

          <div className={styles.priceList}>
            <div></div>
            <span>Total price</span>
            <div className={styles.price}>
              {totalPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>

            <div></div>
            <span>Total shipping fee</span>
            <div className={styles.price}>
              {totalShippingFee.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>

            <div></div>
            <span>Total payment</span>
            <div className={`${styles.price} ${styles.totalPayment}`}>
              {totalPayment.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
          </div>

          <span className={styles.line}></span>

          <div className={styles.order}>
            <Button className={styles.orderBtn} onClick={handleCheckOut}>
              Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
