import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button className="theme-toggle" onClick={() => setDark(!dark)}>
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
