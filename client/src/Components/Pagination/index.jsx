import styles from "./Pagination.module.scss";
import { Arrow } from "../../Assets";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export default function Pagination({
  totalIndex ,
  currentIndex,
  setCurrentIndex,
  arrow = false,
}) {
  const [, setSearchParams] = useSearchParams();
  const updatePageParam = (page) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", page);
      return params;
    });
  };

  useEffect(() => {

  }, [totalIndex, currentIndex])

  const handleNext = () => {
    const next = currentIndex + 1 > totalIndex ? totalIndex : currentIndex + 1;

    setCurrentIndex(next);
    updatePageParam(next);
  };

  const handlePrev = () => {
    const prevPage = currentIndex - 1 < 1 ? 1 : currentIndex - 1;

    setCurrentIndex(prevPage);
    updatePageParam(prevPage);
  };

  const handleClickPage = (page) => {
    setCurrentIndex(page);
    updatePageParam(page);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [currentIndex]);

  return (
    <div className={styles.wrapper}>
      {arrow && (
        <span className={styles.left} onClick={handlePrev}>
          <Arrow />
        </span>
      )}

      {Array.from({ length: totalIndex }, (_, i) => (
        <div
          key={i}
          className={`${styles.circle} ${
            i === currentIndex - 1 ? styles.active : ""
          }`}
          onClick={() => handleClickPage(i + 1)}
        />
      ))}

      {arrow && (
        <span className={styles.right} onClick={handleNext}>
          <Arrow />
        </span>
      )}
    </div>
  );
}
