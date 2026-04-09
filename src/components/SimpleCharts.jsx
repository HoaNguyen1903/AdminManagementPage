import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  const rows = 4;
  for (let i = 1; i < rows; i++) {
    const y = (height / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawSeries(ctx, width, height, labels, series) {
  if (!labels.length) return;
  const maxVal = Math.max(
    1,
    ...series.flatMap(s => s.data),
  );
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // X positions
  const xs = labels.map((_, i) => {
    if (labels.length === 1) return padding;
    return padding + (innerW * i) / (labels.length - 1);
  });

  // Draw each series as a line
  series.forEach(s => {
    ctx.strokeStyle = s.color || '#696cff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.data.forEach((v, i) => {
      const x = xs[i];
      const y = padding + innerH - (innerH * v) / maxVal;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = s.color || '#696cff';
    s.data.forEach((v, i) => {
      const x = xs[i];
      const y = padding + innerH - (innerH * v) / maxVal;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

const SimpleLineChart = ({ labels = [], series = [], height = 240, loading = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, height);
    drawGrid(ctx, rect.width, height);
    drawSeries(ctx, rect.width, height, labels, series);
  }, [labels, series, height]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </Box>
  );
};

export default SimpleLineChart;

