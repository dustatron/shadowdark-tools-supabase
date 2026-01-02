"use client";

import { useRef, useEffect, useState } from "react";
import type { MagicItemForDeck } from "@/lib/validations/deck";

interface MagicItemCardPreviewReactProps {
  magicItem: MagicItemForDeck;
}

// Card dimensions (matching PDF - 2.5" x 3.5" standard card size)
const DIMENSIONS = {
  width: 400,
  height: 570,
};

/**
 * React/HTML version of magic item card preview
 * Mirrors the PDF design exactly for visual consistency
 * Uses CSS scale transform for responsive sizing
 */
export function MagicItemCardPreviewReact({
  magicItem,
}: MagicItemCardPreviewReactProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / DIMENSIONS.width);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: DIMENSIONS.width,
        height: DIMENSIONS.height * scale,
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: DIMENSIONS.width,
          height: DIMENSIONS.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Background Image - using same card template */}
        <img
          src="/blank-card.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* Content Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            paddingTop: "5pt",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Magic Item Name */}
          <div
            style={{
              fontFamily: "Beaufort, serif",
              fontSize: "22px",
              fontWeight: "bolder",
              textTransform: "uppercase",
              textAlign: "center",
              color: "white",
              marginTop: ".6em",
              padding: "0 10px",
            }}
          >
            {magicItem.name}
          </div>

          {/* Type Label */}
          <div
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              fontSize: "12pt",
              fontWeight: 900,
              color: "black",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            Magic Item
          </div>

          {/* Description Section */}
          <div
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              padding: "1em",
              fontSize: "9pt",
              lineHeight: 1.4,
              textAlign: "left",
              color: "#000000",
              marginTop: "1em",
            }}
          >
            {magicItem.description}
          </div>

          {/* Traits Section */}
          {magicItem.traits && magicItem.traits.length > 0 && (
            <div
              style={{
                fontFamily: "Avenir Next Condensed, sans-serif",
                padding: "0 1em",
                fontSize: "8.5pt",
                lineHeight: 1.3,
                color: "#000000",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {magicItem.traits.map((trait, index) => (
                <div key={index} style={{ marginBottom: "6px" }}>
                  <span style={{ fontWeight: "bold" }}>{trait.name}:</span>{" "}
                  {trait.description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
