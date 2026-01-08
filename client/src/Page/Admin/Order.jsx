import { useEffect, useState } from "react";
import { Eyes, Trash } from "../../Assets";
import Breadcrumb from "../../Components/BreadCrumb";
import InputSearch from "../../Components/InputSearch";
import Pagination from "../../Components/Pagination";
import styles from "./Admin.module.scss";
import { getAllOrders, updateOrderStatus } from "../../Api/orderApi";
import Dropdown from "../../Components/Dropdown";
import PopUpOrder from "./Components/PopUpOrder";
import { useSearchParams } from "react-router-dom";

function OrderOption({ item, onStatusChange, children }) {
  const options = ["Pending", "InTransit", "Completed"];
  const [status, setStatus] = useState(item.status);
  const [updating, setUpdating] = useState(false);
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setUpdating(true);
    try {
      await updateOrderStatus(item._id, newStatus);
      onStatusChange && onStatusChange(item._id, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setStatus(item.status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Dropdown options={options} value={status} onChange={handleStatusChange}>
        {children}
        {updating && (
          <span style={{ fontSize: "0.8rem", color: "#666" }}>Updating...</span>
        )}
      </Dropdown>
    </div>
  );
}

export default function OrderAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSelect, setOrderSelect] = useState({});
  const [popUpOrderDetail, setPopUpOrderDetail] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(() => Number(searchParams.get("page")) || 1);
  const limit = 10;

  const handleSelect = (order) => {
    setOrderSelect(order);
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const totalIndex = Math.max(1, Math.ceil(orders.length / limit));

  // ensure page param and currentIndex stay in sync and valid
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    if (page > totalIndex) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", 1);
        return params;
      });
      setCurrentIndex(1);
    } else {
      setCurrentIndex(page);
    }
  }, [searchParams, totalIndex]);

  const handleStatusChange = async (orderId, newStatus) => {
    // show loading while we refresh the list
    setLoading(true);
    try {
      await fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const start = (currentIndex - 1) * limit;
  const pageOrders = orders.slice(start, start + limit);

  return (
    <div className={styles.orderWrapper}>
      <div className={styles.header}>
        <h2>Order List</h2>
        <Breadcrumb />
      </div>
      <div className={`${styles.tableStatistics} ${styles.order}`}>
        <div className={styles.note}>
          Tip search by Order ID: Each product is provided with a unique ID,
          which you can rely on to find the exact product you need.
        </div>
        <span className={styles.groupAction}>
          <InputSearch className={styles.search} />
        </span>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>OrderId</div>
            <div>User</div>
            <div>Quantity</div>
            <div>Price</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          <div className={styles.tableBody}>
            {pageOrders.map((order) => {
              return (
                <div className={styles.tableRow} key={order._id}>
                  <div>{order._id.slice(12)}</div>
                  <div>{order.user.name}</div>
                  <div>
                    {order.orderItems.reduce((total, item) => {
                      return total + item.quantity;
                    }, 0)}
                  </div>
                  <div>
                    {order.price.toLocaleString("vi-VN", {
                      styles: "currency",
                      currency: "VND",
                    })}
                  </div>
                  <OrderOption
                    onStatusChange={handleStatusChange}
                    item={order}
                    className={`${styles.statusBadge}`}
                  >
                    <span
                      className={`${styles[order.status]} ${
                        styles.statusBadge
                      }`}
                    >
                      {order.status}
                    </span>
                  </OrderOption>
                  <div className={styles.action}>
                    <div
                      onClick={() => {
                        handleSelect(order);
                        setPopUpOrderDetail(true);
                      }}
                    >
                      <Eyes />
                    </div>
                    <Trash />
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination totalIndex={totalIndex} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} arrow />
        </div>
      </div>
      {popUpOrderDetail && <PopUpOrder order={orderSelect} popUpOrderDetail={popUpOrderDetail} setPopUpOrderDetail={setPopUpOrderDetail}/>}
    </div>
  );
}
