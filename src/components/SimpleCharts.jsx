import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

// ------------------ Helpers ------------------
function hasValidData(series) {
  return (
    Array.isArray(series) &&
    series.length > 0 &&
    series.some(
      (s) =>
        Array.isArray(s.data) &&
        s.data.some((v) => typeof v === "number" && !isNaN(v))
    )
  );
}

// ------------------ Drawing Functions ------------------
function drawGrid(ctx, width, height, padding) {
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;

  const rows = 4;
  const innerH = height - padding * 2;

  for (let i = 1; i < rows; i++) {
    const y = padding + (innerH / rows) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
}

function drawYAxisLabels(ctx, height, padding, maxVal) {
  if (!maxVal || isNaN(maxVal)) return;

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  const rows = 4;
  const innerH = height - padding * 2;

  for (let i = 0; i <= rows; i++) {
    const value = Math.round((maxVal / rows) * (rows - i));
    const y = padding + (innerH / rows) * i;

    ctx.fillText(value.toString(), padding - 8, y);
  }
}

function drawXAxisLabels(ctx, width, height, padding, labels) {
  if (!labels.length) return;

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const innerW = width - padding * 2;
  const y = height - padding + 8;

  // show only a few labels if too many
  const step = labels.length > 10 ? Math.ceil(labels.length / 6) : 1;

  labels.forEach((label, i) => {
    if (i % step !== 0 && i !== labels.length - 1) return;

    const x =
      labels.length === 1
        ? padding
        : padding + (innerW * i) / (labels.length - 1);

    ctx.fillText(label, x, y);
  });
}

function getPoints(width, height, padding, labels, series) {
  if (!labels.length) return [];

  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const xs = labels.map((_, i) => {
    if (labels.length === 1) return padding;
    return padding + (innerW * i) / (labels.length - 1);
  });

  const points = [];

  series.forEach((s, seriesIndex) => {
    s.data.forEach((v, i) => {
      const x = xs[i];
      const y = padding + innerH - (innerH * v) / maxVal;

      points.push({
        x,
        y,
        value: v,
        label: labels[i],
        seriesName: s.name || `Series ${seriesIndex + 1}`,
        color: s.color || "#696cff",
      });
    });
  });

  return points;
}

function drawSeries(ctx, width, height, labels, series, padding) {
  if (!labels.length) return 1;

  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const xs = labels.map((_, i) => {
    if (labels.length === 1) return padding;
    return padding + (innerW * i) / (labels.length - 1);
  });

  series.forEach((s) => {
    ctx.strokeStyle = s.color || "#696cff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    s.data.forEach((v, i) => {
      const x = xs[i];
      const y = padding + innerH - (innerH * v) / maxVal;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // points
    ctx.fillStyle = s.color || "#696cff";
    s.data.forEach((v, i) => {
      const x = xs[i];
      const y = padding + innerH - (innerH * v) / maxVal;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  return maxVal;
}

function drawTooltip(ctx, tooltip, padding, width) {
  if (!tooltip) return;

  const { x, y, label, value, seriesName } = tooltip;

  const text1 = label;
  const text2 = `${seriesName}: ${value}`;

  ctx.font = "12px Arial";

  const boxWidth =
    Math.max(ctx.measureText(text1).width, ctx.measureText(text2).width) + 18;
  const boxHeight = 44;

  let boxX = x + 12;
  let boxY = y - boxHeight - 12;

  // prevent overflow
  if (boxX + boxWidth > width) boxX = x - boxWidth - 12;
  if (boxY < padding) boxY = y + 12;

  // tooltip background
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
  ctx.fill();

  // tooltip text
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text1, boxX + 9, boxY + 6);
  ctx.fillText(text2, boxX + 9, boxY + 22);

  // highlight point
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ------------------ Component ------------------
const SimpleLineChart = ({
  labels = [],
  series = [],
  height = 240,
  loading = false,
}) => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const padding = 45;
  const noData = !labels.length || !hasValidData(series);

  const points = useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    const rect = canvas.getBoundingClientRect();
    return getPoints(rect.width, height, padding, labels, series);
  }, [labels, series, height]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, rect.width, height);

    drawGrid(ctx, rect.width, height, padding);

    if (noData) return;

    const maxVal = drawSeries(ctx, rect.width, height, labels, series, padding);

    drawYAxisLabels(ctx, height, padding, maxVal);
    drawXAxisLabels(ctx, rect.width, height, padding, labels);

    drawTooltip(ctx, tooltip, padding, rect.width);
  };

  useEffect(() => {
    redraw();
  }, [labels, series, height, tooltip, noData]);

  const handleMouseMove = (e) => {
    if (noData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let nearest = null;
    let minDist = Infinity;

    points.forEach((p) => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });

    if (nearest && minDist < 12) {
      setTooltip(nearest);
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {noData && !loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            color: "text.secondary",
            textAlign: "center",
            px: 2,
          }}
        >
          <Box sx={{ fontSize: 16, fontWeight: "bold" }}>No data found</Box>
          <Box sx={{ fontSize: 13 }}>
            No data available for this selected period.
          </Box>
        </Box>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height, cursor: noData ? "default" : "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </Box>
  );
};

export default SimpleLineChart;