import { Search } from "../../Assets";
import clsx from "clsx";
import styles from "./InputSearch.module.scss";
import { useState } from "react";

export default function InputSearch({
  placeholder = "Search",
  icon = true,
  onChange,
  id = "",
  className,
  type = "text",
  value = "",
}) {

  const [inputValue, setInputValue] = useState(value);

  const classNames = clsx(styles.wrapper, className, {
    [styles.withIcon]: icon,
  });

  const handleInputChange = (val) => {
    setInputValue(val);
    onChange && onChange(val);
  }

  return (
    <div className={classNames}>
      <input
        className={styles.input}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        type={type}
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
