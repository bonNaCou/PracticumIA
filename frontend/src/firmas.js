document.querySelectorAll(".canvas-firma").forEach(canvas => {

  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  let dibujando = false;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const start = (e) => {
    dibujando = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!dibujando) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stop = () => {
    dibujando = false;
    ctx.closePath();
  };

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseleave", stop);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    start(e);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e);
  });
  canvas.addEventListener("touchend", stop);

  const clearBtn = canvas.parentElement.nextElementSibling;
  if (clearBtn && clearBtn.classList.contains("firma-clear-btn")) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

});