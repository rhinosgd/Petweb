/**
 * 访问趋势图：纯内联 SVG 折线 + 渐变填充，无需图表库。
 */
export function VisitsChart({ data, height = 180 }: { data: number[]; height?: number }) {
  const width = 640;
  const pad = 24;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = Math.max(max - min, 1);

  const points = data.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1);
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height - pad} L${points[0][0].toFixed(1)},${height - pad} Z`;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Visits over the last 7 days">
      <defs>
        <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A67C52" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#A67C52" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 横向网格线 */}
      {[0, 1, 2, 3].map((i) => {
        const y = pad + (i * (height - pad * 2)) / 3;
        return <line key={i} x1={pad} y1={y} x2={width - pad} y2={y} stroke="#1A1A1A" strokeOpacity="0.07" strokeWidth="1" />;
      })}

      <path d={area} fill="url(#visitsFill)" />
      <path d={line} fill="none" stroke="#A67C52" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="#fff" stroke="#A67C52" strokeWidth="2" />
          <text x={x} y={height - 6} textAnchor="middle" fontSize="11" fill="#1A1A1A" opacity="0.45">
            {days[i] ?? ""}
          </text>
        </g>
      ))}
    </svg>
  );
}
