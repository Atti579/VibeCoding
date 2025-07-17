"use client";

import React, { useState, useRef } from "react";
import Wheel from "./Wheel";

const defaultSegments = [
  { color: "#e57373", text: "" },
  { color: "#64b5f6", text: "" },
  { color: "#81c784", text: "" },
  { color: "#ffd54f", text: "" },
  { color: "#ba68c8", text: "" },
  { color: "#ffb74d", text: "" },
  { color: "#4db6ac", text: "" },
  { color: "#a1887f", text: "" },
];

const CHALLENGE_KEYWORDS = [
  "You start 1-0 down",
  "No sprint for 1st half",
  "Only score with headers",
  "Weak foot only",
  "No slide tackles",
  "Must score from outside box",
  "Keeper rushes on corners",
  "No passing back",
  "Score with a volley",
  "No skill moves",
  "Only use one formation",
  "No substitutions",
  "Score with defender",
  "No crossing",
  "No pausing",
  "Score from a corner",
  "No long shots",
  "No through balls",
  "Score with a chip shot",
  "No using star player"
];

function SpecialModal({ open, text, onClose, color }: { open: boolean; text: string; onClose: () => void; color: string }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.25)',
      animation: 'fadeInBg 0.5s',
    }}>
      <div style={{
        minWidth: 320,
        maxWidth: 400,
        padding: '2.5rem 2rem 2rem 2rem',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: `2.5px solid ${color}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#222',
        textAlign: 'center',
        position: 'relative',
        animation: 'popIn 0.6s cubic-bezier(.68,-0.55,.27,1.55)',
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 16,
          letterSpacing: 1.2,
          color: color,
          textShadow: '0 2px 12px #fff, 0 1px 4px ' + color,
          textTransform: 'uppercase',
        }}>
          🎉 Result 🎉
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          marginBottom: 12,
          color: color,
          textShadow: '0 2px 12px #fff, 0 1px 4px ' + color,
        }}>
          {text || 'No text'}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            padding: '10px 32px',
            fontSize: 18,
            borderRadius: 8,
            border: 'none',
            background: color,
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            letterSpacing: 1.1,
            transition: 'background 0.2s',
          }}
        >
          Close
        </button>
      </div>
      <style jsx global>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInBg {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [segments, setSegments] = useState(defaultSegments);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const spinningRef = useRef(false);

  const handleTextChange = (idx: number, value: string) => {
    setSegments((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], text: value };
      return updated;
    });
  };

  const handleRotate = () => {
    if (spinning) return;
    setSpinning(true);
    spinningRef.current = true;
    setSelectedIndex(null); // Clear highlight while spinning
    setShowModal(false);
    const segmentCount = segments.length;
    const randomSegment = Math.floor(Math.random() * segmentCount);
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-9 full spins
    // Center the selected segment at the top (arrow)
    const anglePerSegment = 360 / segmentCount;
    const offset = anglePerSegment / 2; // So the center of the segment aligns with the arrow
    const finalAngle = 360 * extraSpins + (360 - (randomSegment * anglePerSegment + offset));
    const duration = 1000 + Math.random() * 4000; // 1-5s
    const start = rotation % 360;
    const end = finalAngle;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const current = start + (end - start) * ease;
      setRotation(current);
      if (t < 1 && spinningRef.current) {
        requestAnimationFrame(animate);
      } else {
        setRotation(end);
        setSpinning(false);
        spinningRef.current = false;
        setSelectedIndex(randomSegment);
        setTimeout(() => setShowModal(true), 400); // Show modal after a short delay
      }
    }
    requestAnimationFrame(animate);
  };

  const randomizeSegments = () => {
    // Shuffle the challenge keywords and pick as many as segments
    const shuffled = [...CHALLENGE_KEYWORDS].sort(() => Math.random() - 0.5);
    setSegments((prev) => prev.map((seg, idx) => ({
      ...seg,
      text: shuffled[idx % shuffled.length],
    })));
  };

  const selectedText = selectedIndex !== null ? segments[selectedIndex].text : '';
  const selectedColor = selectedIndex !== null ? segments[selectedIndex].color : '#2196f3';

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9f9f9",
      }}
    >
      <h1
        style={{
          fontSize: 40,
          fontWeight: 900,
          background: 'linear-gradient(90deg, #ff9800, #ff4081, #2196f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 24px rgba(255, 64, 129, 0.3), 0 2px 8px #2196f3',
          marginBottom: 32,
          letterSpacing: 1.5,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        Customize this Wheel and Rotate it!
      </h1>
      <button
        onClick={randomizeSegments}
        style={{
          marginBottom: 24,
          padding: '10px 32px',
          fontSize: 20,
          borderRadius: 8,
          border: 'none',
          background: 'linear-gradient(90deg, #ff9800, #ff4081, #2196f3)',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          letterSpacing: 1.1,
          transition: 'background 0.2s',
        }}
      >
        🎲 Randomize
      </button>
      <SpecialModal open={showModal} text={selectedText} color={selectedColor} onClose={() => setShowModal(false)} />
      <Wheel segments={segments} size={400} rotation={rotation} selectedIndex={selectedIndex ?? undefined} />
      <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {segments.map((seg, idx) => (
          <input
            key={idx}
            type="text"
            value={seg.text}
            placeholder={`Segment ${idx + 1}`}
            onChange={e => handleTextChange(idx, e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", width: 120, color: '#000' }}
            disabled={spinning}
          />
        ))}
      </div>
      <button
        onClick={handleRotate}
        style={{ marginTop: 24, padding: "12px 32px", fontSize: 18, borderRadius: 8, border: "none", background: "#333", color: "#fff", cursor: spinning ? "not-allowed" : "pointer", opacity: spinning ? 0.6 : 1 }}
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Rotate Wheel"}
      </button>
    </main>
  );
}
