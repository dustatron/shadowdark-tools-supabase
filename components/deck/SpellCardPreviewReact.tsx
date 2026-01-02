"use client";

import { useRef, useEffect, useState } from "react";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellCardPreviewReactProps {
  spell: SpellForDeck;
}

// Match the PDF preview margins exactly
const MARGINS = {
  rowOne: "5px",
  rowTwo: "1.5em",
  rowThree: "1.6em",
};

// Card dimensions (matching PDF)
const DIMENSIONS = {
  width: 400,
  height: 570,
};

/**
 * React/HTML version of spell card preview
 * Mirrors the PDF design exactly for visual consistency
 * Uses CSS scale transform for responsive sizing
 */
export function SpellCardPreviewReact({ spell }: SpellCardPreviewReactProps) {
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
        {/* Background Image */}
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
          {/* Spell Name */}
          <div
            style={{
              fontFamily: "Beaufort, serif",
              fontSize: "25px",
              fontWeight: "bolder",
              textTransform: "uppercase",
              textAlign: "center",
              color: "white",
              marginTop: ".6em",
            }}
          >
            {spell.name}
          </div>

          {/* Tier and Classes Row */}
          <div
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              marginBottom: "12pt",
              fontSize: "10pt",
              marginTop: MARGINS.rowOne,
            }}
          >
            {spell.classes && spell.classes.length > 0 && (
              <span
                style={{
                  fontFamily: "Avenir Next Condensed, sans-serif",
                  fontSize: "12pt",
                  color: "black",
                  width: "58.5%",
                  textAlign: "center",
                  fontWeight: 900,
                  textTransform: "capitalize",
                }}
              >
                {spell.classes.join(", ")}
              </span>
            )}
            <span
              style={{
                fontFamily: "Avenir Next Condensed, sans-serif",
                fontSize: "12pt",
                fontWeight: 900,
                width: "40%",
                color: "black",
                textAlign: "center",
              }}
            >
              Tier {spell.tier}
            </span>
          </div>

          {/* Metadata Section */}
          <div
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              color: "#000000",
              width: "100%",
              marginTop: MARGINS.rowTwo,
            }}
          >
            <span
              style={{
                fontFamily: "Avenir Next Condensed, sans-serif",
                fontWeight: "bold",
                width: "50%",
                textAlign: "center",
              }}
            >
              {spell.range}
            </span>
            <span
              style={{
                fontFamily: "Avenir Next Condensed, sans-serif",
                fontWeight: "bold",
                width: "50%",
                textAlign: "center",
              }}
            >
              {spell.duration}
            </span>
          </div>

          {/* Description Section */}
          <div
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              padding: "1.2em",
              fontSize: "9.5pt",
              lineHeight: 1.4,
              textAlign: "left",
              color: "#000000",
              flex: 1,
              marginTop: MARGINS.rowThree,
            }}
          >
            {spell.description}
          </div>
        </div>
      </div>
    </div>
  );
}
