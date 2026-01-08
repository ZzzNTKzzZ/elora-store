import styles from "./Admin.module.scss";
import { useEffect, useState } from "react";
import { Eyes, Pen, Trash } from "../../Assets";
import InputSearch from "../../Components/InputSearch";
import Button from "../../Components/Button";
import Breadcrumb from "../../Components/BreadCrumb";
import Pagination from "../../Components/Pagination";
import { useSearchParams } from "react-router-dom";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(() => Number(searchParams.get("page")) || 1);
  const limit = 10;
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const resUsers = await fetch("http://localhost:5000/user");
        const dataUsers = await resUsers.json();
        setUsers(dataUsers || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  
  const totalIndex = Math.max(1, Math.ceil(users.length / limit));

  // Ensure currentIndex is valid
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

  const start = (currentIndex - 1) * limit;
  const pageUsers = users.slice(start, start + limit);
  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.userWrapper}>
      <div className={styles.header}>
      <h2>All User</h2>
      <Breadcrumb />
      </div>
      <div className={`${styles.tableStatistics} ${styles.user}`}>
        <span className={styles.groupAction}>
      <InputSearch className={styles.search}/>
      <Button className={styles.add}>
        + Add new
      </Button>
        </span>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Action</div>
          </div>

          <div className={styles.tableBody}>
            {pageUsers.map((user) => (
              <div className={styles.tableRow} key={user._id}>
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>{user.phone}</div>
                <div className={styles.action}>
                  <Eyes />
                  <Pen />
                  <Trash />
                </div>
              </div>
            ))}
          </div>
          <Pagination totalIndex={totalIndex} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} arrow />
        </div>
      </div>
    </div>
  );
}
