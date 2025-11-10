"use client";

import { useEffect, useState } from "react";
import { SpellCardPDF, SPELL_CARD_DESIGN } from "@/components/pdf/SpellCard";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellCardPreviewProps {
  spell: SpellForDeck;
}

/**
 * Live PDF preview of spell card
 * Shows the actual PDF that will be exported - WYSIWYG
 */
export function SpellCardPreview({ spell }: SpellCardPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [PDFComponents, setPDFComponents] = useState<any>(null);
  const { width, height } = SPELL_CARD_DESIGN.dimensions;

  useEffect(() => {
    setMounted(true);
    // Dynamically import PDF components to avoid SSR issues
    import("@react-pdf/renderer").then((module) => {
      setPDFComponents({
        PDFViewer: module.PDFViewer,
        Document: module.Document,
        Page: module.Page,
      });
    });
  }, []);

  if (!mounted || !PDFComponents) {
    // Loading skeleton matching card dimensions
    return (
      <div
        style={{
          width: width.inches,
          height: height.inches,
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          Loading preview...
        </div>
      </div>
    );
  }

  const { PDFViewer, Document, Page } = PDFComponents;

  return (
    <PDFViewer
      width={width.px}
      height={height.px}
      showToolbar={true}
      style={{ border: "none" }}
    >
      <Document>
        <Page size={{ width: width.pt, height: height.pt }}>
          <SpellCardPDF spell={spell} isPreview={true} />
        </Page>
      </Document>
    </PDFViewer>
  );
}
