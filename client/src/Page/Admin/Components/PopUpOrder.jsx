import { useEffect, useRef, useState } from "react";
import styles from "./componentAdmin.module.scss";
import { getOrderById } from "../../../Api/orderApi";
import useClickOutside from "../../../Hook/useClickOutSide";

export default function PopUpOrder({
  order,
  setPopUpOrderDetail,
  popUpOrderDetail,
}) {
  const popUpRef = useRef();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getOrderById(order._id);
      console.log(data.order);
      setItems(data.order);
      setLoading(false);
    };
    fetchOrder();
  }, [order]);
  if (loading) return <div className={styles.loading}>Loading...</div>;

  // useClickOutside(popUpRef, () => setPopUpOrderDetail(false), popUpOrderDetail)

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer} ref={popUpRef}>
        <div className={styles.popupHeader}>
          <h2>Order Details</h2>
          <p className={styles.orderId}>Order ID: {order._id}</p>
        </div>

        <div className={styles.popupContent}>
          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Customer:</span>
              <span className={styles.value}>{order.user.name || "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${styles[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Total:</span>
              <span className={styles.value}>
                {order.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
          </div>

          <div className={styles.itemsSection}>
            <h3>Items</h3>
            <div className={styles.itemsList}>
              {items?.orderItems?.length > 0 ? (
                items.orderItems.map((item) => (
                  <div key={item._id} className={styles.itemCard}>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.product.name}</p>

                      <p className={styles.itemPrice}>
                        {item.product.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </p>
                    </div>

                    <div className={styles.itemQuantity}>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <div className={styles.itemTotal}>
                      <span>
                        {(item.product.price * item.quantity).toLocaleString(
                          "vi-VN",
                          {
                            style: "currency",
                            currency: "VND",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noItems}>No items in this order</p>
              )}
            </div>
          </div>

          {order.address && (
            <div className={styles.addressSection}>
              <h3>Shipping Address</h3>
              <p className={styles.address}>{order.address}</p>
            </div>
          )}
        </div>

        <div className={styles.popupFooter}>
          <button
            className={styles.closeBtn}
            onClick={() => setPopUpOrderDetail(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
