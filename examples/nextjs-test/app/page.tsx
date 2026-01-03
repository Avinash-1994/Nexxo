import React from 'react';

export default function AppHome() {
  return (
    <div style={{ padding: "40px", fontFamily: "system-ui", textAlign: "center" }}>
      <h1 style={{ color: "#000", fontSize: "3rem", fontWeight: "800" }}>▲ Urja Build Tool - Next.js Test</h1>
      <p style={{ fontSize: "1.2rem", color: "#666" }}>Framework: <strong>Next.js 14 (App Router)</strong></p>
      <div style={{ marginTop: "20px", padding: "20px", background: "#f0f0f0", borderRadius: "10px" }}>
        <p>Status: ✅ App Router & RSC Simulation Verified</p>
        <p>Testing layouts, segments, and metadata handling.</p>
      </div>
    </div>
  );
}
