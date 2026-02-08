import "./NavigationArrows.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function NavigationArrows() {
  return (
    <div className="nav-arrows">
      <button onClick={() => window.history.back()}>
        <FaArrowLeft />
      </button>
      <button onClick={() => window.history.forward()}>
        <FaArrowRight />
      </button>
    </div>
  );
}
