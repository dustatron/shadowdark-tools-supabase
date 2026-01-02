"use client";

import { useEffect, useState } from "react";
import {
  MagicItemCardPDF,
  MAGIC_ITEM_CARD_DESIGN,
} from "@/components/pdf/MagicItemCard";
import type { MagicItemForDeck } from "@/lib/validations/deck";

interface MagicItemCardPreviewProps {
  magicItem: MagicItemForDeck;
}

/**
 * Live PDF preview of magic item card
 * Shows the actual PDF that will be exported - WYSIWYG
 */
export function MagicItemCardPreview({ magicItem }: MagicItemCardPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [PDFComponents, setPDFComponents] = useState<any>(null);
  const { width, height } = MAGIC_ITEM_CARD_DESIGN.dimensions;

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
      width="100%"
      height="100%"
      showToolbar={true}
      style={{ border: "none", minHeight: "33rem" }}
    >
      <Document>
        <Page size={{ width: width.pt, height: height.pt }}>
          <MagicItemCardPDF magicItem={magicItem} isPreview={true} />
        </Page>
      </Document>
    </PDFViewer>
  );
}
