import { Search } from "../../Assets";
import clsx from "clsx";
import styles from "./Input.module.scss";

export default function Input({
  placeholder = "Search",
  icon = true,
  onChange,
  id = "",
  className,
  type = "text",
}) {
  const classNames = clsx(styles.wrapper, className, {
    [styles.withIcon]: icon,
  });

  return (
    <div className={classNames}>
      <input
        className={styles.input}
        placeholder={placeholder}
        type={type}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...(id ? { id } : {})}
        style={{ color: "#000" }}
      />
      {icon && (
        <button className={styles.icon} type="button">
          <Search />
        </button>
      )}
    </div>
  );
}
