"use client";

import React from "react";

type Segment = {
  color: string;
  text: string;
};

type WheelProps = {
  segments: Segment[];
  size?: number;
  rotation?: number;
  selectedIndex?: number;
};

const FireworksBurst: React.FC<{ size: number; delay: number; x: number; y: number }> = ({ size, delay, x, y }) => {
  const center = size / 2;
  const lines = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const rad = (angle * Math.PI) / 180;
    const x2 = center + Math.cos(rad) * (center * 0.8);
    const y2 = center + Math.sin(rad) * (center * 0.8);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke={`hsl(${angle + delay * 100}, 90%, 60%)`}
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  });
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 10,
        animation: `fireworks-burst 1s cubic-bezier(0.4,0,0.2,1) ${delay}s both`
      }}
    >
      {lines}
      <circle cx={center} cy={center} r={size * 0.08} fill="#fff" opacity={0.7} />
    </svg>
  );
};

const Fireworks: React.FC<{ show: boolean; size: number }> = ({ show, size }) => {
  if (!show) return null;
  // Symmetrical bursts: for each burst on one side, mirror it on the other
  const centerX = size / 2;
  const baseBursts = [
    { size: size * 0.7, delay: 0.1, dx: size * 0.18, dy: -size * 0.7 },
    { size: size * 0.5, delay: 0.2, dx: size * 0.32, dy: -size * 0.45 },
    { size: size * 0.6, delay: 0.3, dx: size * 0.12, dy: -size * 1.0 },
    { size: size * 0.4, delay: 0.4, dx: size * 0.35, dy: -size * 0.9 },
  ];
  // Center burst
  const centerBurst = { size: size, delay: 0, dx: 0, dy: -size * 0.7 };
  // For each base burst, add its mirrored pair
  const bursts = [
    centerBurst,
    ...baseBursts.flatMap(b => [
      { ...b, x: centerX + b.dx, y: b.dy },
      { ...b, x: centerX - b.dx, y: b.dy },
    ]),
  ];
  return (
    <>
      {bursts.map((b, i) => (
        <FireworksBurst key={i} size={b.size} delay={b.delay} x={b.x ?? centerX} y={b.y ?? b.dy} />
      ))}
    </>
  );
};

const Wheel: React.FC<WheelProps> = ({ segments, size = 400, rotation = 0, selectedIndex }) => {
  if (!segments || segments.length === 0) {
    return <div>No segments to display</div>;
  }
  const radius = size / 2;
  const angle = 360 / segments.length;

  // Helper to convert polar to cartesian
  const polarToCartesian = (angleDeg: number) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: radius + radius * Math.cos(rad),
      y: radius + radius * Math.sin(rad),
    };
  };

  let paths = [];
  let texts = [];

  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * angle;
    const endAngle = (i + 1) * angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);

    const d = [
      `M ${radius} ${radius}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");

    // No highlight animation
    paths.push(
      <path key={i} d={d} fill={segments[i].color} />
    );

    // Text position (middle of segment)
    const textAngle = startAngle + angle / 2;
    const textRadius = radius * 0.7;
    const textCoords = {
      x: radius + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180)),
      y: radius + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180)),
    };
    // Fit text: split into lines if too long, and adjust font size
    const maxCharsPerLine = 16;
    const words = segments[i].text.split(' ');
    let lines = [];
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += ' ' + word;
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    // Adjust font size based on number of lines
    const baseFontSize = size / 18;
    const fontSize = baseFontSize * (lines.length > 2 ? 0.8 : 1) * (lines.length > 3 ? 0.7 : 1);
    texts.push(
      <text
        key={i}
        x={textCoords.x}
        y={textCoords.y - ((lines.length - 1) * fontSize) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill="#000"
        style={{ userSelect: "none", pointerEvents: "none", maxWidth: radius * 1.2 }}
        transform={`rotate(${textAngle}, ${textCoords.x}, ${textCoords.y})`}
      >
        {lines.map((line, idx) => (
          <tspan x={textCoords.x} dy={idx === 0 ? 0 : fontSize * 1.1} key={idx}>{line}</tspan>
        ))}
      </text>
    );
  }

  // Arrow size and position
  const arrowWidth = size * 0.08;
  const arrowHeight = size * 0.07;
  const arrowY = -arrowHeight - 8; // 8px gap above the wheel

  return (
    <div style={{ position: "relative", width: size, margin: "0 auto" }}>
      {/* Fireworks effect */}
      <Fireworks show={typeof selectedIndex === 'number'} size={radius} />
      {/* Arrow indicator */}
      <svg
        width={arrowWidth}
        height={arrowHeight}
        style={{
          position: "absolute",
          left: `calc(50% - ${arrowWidth / 2}px)`,
          top: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <polygon
          points={`0,0 ${arrowWidth},0 ${arrowWidth / 2},${arrowHeight}`}
          fill="#333"
          stroke="#fff"
          strokeWidth={2}
        />
      </svg>
      {/* Wheel SVG */}
      <svg
        width={size}
        height={size}
        style={{ display: "block", margin: "0 auto" }}
      >
        {/* Solid border, ensure not clipped */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 6}
          fill="none"
          stroke="#2196f3"
          strokeWidth={6}
        />
        <g transform={`rotate(${rotation}, ${radius}, ${radius})`}>
          {paths}
          {texts}
        </g>
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.05}
          fill="#fff"
          stroke="#ccc"
          strokeWidth={2}
        />
      </svg>
      <style jsx global>{`
        @keyframes fireworks-burst {
          0% { opacity: 1; transform: scale(0.5); }
          70% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default Wheel; 