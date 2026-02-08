import { useRef, useEffect } from "react";

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4f46e5"; 
  }, []);

  const startDraw = (e) => {
    drawing.current = true;
    draw(e);
  };

  // guardador de firmas

  const endDraw = () => {
    drawing.current = false;
    const canvas = canvasRef.current;
    onChange?.(canvas.toDataURL()); 
  };

  const draw = (e) => {
    if (!drawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange?.(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={420}
        height={160}
        style={{
          border: "2px dashed #7c7cff",
          borderRadius: "12px",
          background: "#fff"
        }}
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
        onTouchStart={startDraw}
        onTouchEnd={endDraw}
        onTouchMove={draw}
      />

      <button
        type="button"
        onClick={clear}
        style={{ marginTop: 8 }}
        className="dashboard-btn"
      >
        Limpiar firma
      </button>
    </div>
  );
}