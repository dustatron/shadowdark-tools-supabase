"use client";

import { useRef, useEffect, useState } from "react";
import type { MagicItemForDeck } from "@/lib/validations/deck";
import { getTransformedImageUrl } from "@/lib/utils/cloudinary";

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
          src="/magic-item/magic-item-card-frame.png"
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
            paddingTop: "2px",
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
              marginTop: ".2em",
              padding: "0",
            }}
          >
            {magicItem.name}
          </div>
          {/* Magic Item Image */}
          {magicItem.image_url && (
            <div
              className="bg-black"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "0",
              }}
            >
              <img
                src={getTransformedImageUrl(magicItem.image_url, "thumb") || ""}
                alt={magicItem.name}
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          <img src="/magic-item/magic-item-seperator.png" alt="" />
          {/* Description Section */}
          <div
            className="px-3 pb-2"
            style={{
              fontFamily: "Avenir Next Condensed, sans-serif",
              fontSize: "9.5pt",
              lineHeight: 1.4,
              color: "#000000",
            }}
          >
            {magicItem.description}
          </div>
          {/* Traits Section */}
          {magicItem.traits && magicItem.traits.length > 0 && (
            <div
              style={{
                fontFamily: "Avenir Next Condensed, sans-serif",
                padding: "0",
                fontSize: "9.5pt",
                lineHeight: 1.3,
                color: "#000000",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {/* Group traits by name */}
              {Object.entries(
                magicItem.traits.reduce(
                  (acc, trait) => {
                    if (!acc[trait.name]) {
                      acc[trait.name] = [];
                    }
                    acc[trait.name].push(trait.description);
                    return acc;
                  },
                  {} as Record<string, string[]>,
                ),
              ).map(([traitName, descriptions]) => (
                <div key={traitName} style={{ marginBottom: "6px" }}>
                  <div
                    style={{
                      position: "relative",
                      marginBottom: "2px",
                    }}
                  >
                    <img
                      src="/magic-item/magic-item-header-bar.png"
                      alt=""
                      style={{ display: "block" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "12px",
                        transform: "translateY(-50%)",
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "white",
                      }}
                    >
                      {traitName}:
                    </span>
                  </div>
                  {descriptions.map((description, idx) => (
                    <div key={idx} className="px-3 pb-2">
                      {description}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
