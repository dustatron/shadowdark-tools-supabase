/**
 * Magic Item Card Component - PDF Implementation
 *
 * PDF implementation of the magic item card for deck export.
 * Follows same pattern as SpellCard.tsx but adapted for magic item content.
 */

import { View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { MagicItemForDeck } from "@/lib/validations/deck";
import path from "path";

// Register custom fonts - different approach for local vs Vercel
if (typeof window === "undefined") {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    // Vercel: Use absolute URLs to deployed assets
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`;
    Font.register({
      family: "Beaufort",
      src: `${baseUrl}/fonts/beaufort-w01-bold.ttf`,
    });

    Font.register({
      family: "Avenir Next Condensed",
      src: `${baseUrl}/fonts/avenir-next-condensed-bold.ttf`,
    });

    Font.register({
      family: "Avenir Next Condensed Regular",
      src: `${baseUrl}/fonts/avenir-next-condensed-regular.otf`,
    });
  } else {
    // Local: Use filesystem paths (synchronous)
    Font.register({
      family: "Beaufort",
      src: path.join(process.cwd(), "public", "fonts", "beaufort-w01-bold.ttf"),
    });

    Font.register({
      family: "Avenir Next Condensed",
      src: path.join(
        process.cwd(),
        "public",
        "fonts",
        "avenir-next-condensed-bold.ttf",
      ),
    });

    Font.register({
      family: "Avenir Next Condensed Regular",
      src: path.join(
        process.cwd(),
        "public",
        "fonts",
        "avenir-next-condensed-regular.otf",
      ),
    });
  }
} else {
  // Browser-side: use relative URLs
  Font.register({
    family: "Beaufort",
    src: "/fonts/beaufort-w01-bold.ttf",
  });

  Font.register({
    family: "Avenir Next Condensed",
    src: "/fonts/avenir-next-condensed-bold.ttf",
  });

  Font.register({
    family: "Avenir Next Condensed Regular",
    src: "/fonts/avenir-next-condensed-regular.otf",
  });
}

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

/** Card dimensions - standard playing card size (2.5" x 3.5") */
export const MAGIC_ITEM_CARD_DESIGN = {
  dimensions: {
    width: {
      inches: "2.5in",
      pt: 180, // 2.5 * 72
    },
    height: {
      inches: "3.5in",
      pt: 252, // 3.5 * 72
    },
  },
} as const;

// ============================================================================
// PDF VERSION (for @react-pdf/renderer)
// ============================================================================

/** PDF-specific styles using @react-pdf/renderer StyleSheet */
export const pdfMagicItemCardStyles = StyleSheet.create({
  singleCard: {
    position: "relative",
    height: "100%",
    width: "100%",
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  contentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    paddingTop: "2pt",
    display: "flex",
    flexDirection: "column",
  },

  itemName: {
    fontFamily: "Beaufort",
    fontSize: "9.5pt",
    fontWeight: "900",
    textTransform: "uppercase",
    textAlign: "center",
    color: "white",
    marginTop: "1.5pt",
  },

  imageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    marginBottom: 0,
  },

  magicItemImage: {
    width: "50pt",
    height: "50pt",
    objectFit: "contain",
  },

  separator: {
    width: "100%",
    marginTop: "-1pt",
  },

  description: {
    fontFamily: "Avenir Next Condensed Regular",
    paddingHorizontal: "6pt",
    paddingBottom: "2pt",
    fontSize: "7px",
    lineHeight: 1.4,
    textAlign: "left",
    color: "#000000",
  },

  traitsContainer: {
    fontFamily: "Avenir Next Condensed Regular",
    fontSize: "7pt",
    lineHeight: 1.3,
    color: "#000000",
    flex: 1,
  },

  traitGroup: {
    marginBottom: "3pt",
  },

  traitHeaderContainer: {
    position: "relative",
    marginBottom: "1pt",
  },

  traitHeaderBar: {
    width: "100%",
    height: "10pt",
  },

  traitHeaderText: {
    position: "absolute",
    top: "1pt",
    left: "8pt",
    fontFamily: "Avenir Next Condensed",
    fontWeight: "bold",
    fontSize: "7px",
    color: "white",
  },

  traitDescription: {
    paddingHorizontal: "6pt",
    paddingBottom: "2.4pt",
    fontSize: "7px",
    lineHeight: 1.2,
  },
});

// Helper to get image URL for PDF (handles browser vs server)
function getPdfImageUrl(relativePath: string): string {
  if (typeof window !== "undefined") {
    return relativePath;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${relativePath}`;
}

// Helper to transform cloudinary URLs for PDF
function getCloudinaryPdfUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Build transform string for PDF (smaller size for cards)
  // Use c_fit to preserve aspect ratio, f_png for PDF compatibility
  const transforms = "w_100,h_100,c_fit,q_auto,f_png,bg_transparent";
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dvmzgveqf";

  let directUrl: string;

  // Check if it's a full Cloudinary URL
  const cloudinaryMatch = url.match(
    /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/,
  );

  if (cloudinaryMatch) {
    const [, matchedCloudName, pathWithVersion] = cloudinaryMatch;
    const cleanPath = pathWithVersion.replace(/^v\d+\//, "");
    directUrl = `https://res.cloudinary.com/${matchedCloudName}/image/upload/${transforms}/${cleanPath}`;
  } else if (!url.startsWith("http")) {
    // It's a public_id, build full URL
    directUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${url}`;
  } else {
    // Unknown URL format
    return url;
  }

  // In browser, use proxy to avoid CORS issues with PDF renderer
  if (typeof window !== "undefined") {
    return `/api/image-proxy?url=${encodeURIComponent(directUrl)}`;
  }

  return directUrl;
}

// Helper to group traits by name
function groupTraitsByName(
  traits: { name: string; description: string }[],
): Record<string, string[]> {
  return traits.reduce(
    (acc, trait) => {
      if (!acc[trait.name]) {
        acc[trait.name] = [];
      }
      acc[trait.name].push(trait.description);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}

/**
 * Magic Item Card Component for PDF rendering
 * Used by @react-pdf/renderer to generate printable cards
 */
export const MagicItemCardPDF = ({
  magicItem,
}: {
  magicItem: MagicItemForDeck;
}) => {
  const frameUrl = getPdfImageUrl("/magic-item/magic-item-card-frame.png");
  const separatorUrl = getPdfImageUrl("/magic-item/magic-item-seperator.png");
  const headerBarUrl = getPdfImageUrl("/magic-item/magic-item-header-bar.png");

  // Get Cloudinary image URL - Cloudinary supports CORS
  const magicItemImageUrl = getCloudinaryPdfUrl(magicItem.image_url);

  // Group traits by name
  const groupedTraits = magicItem.traits
    ? groupTraitsByName(magicItem.traits)
    : {};

  return (
    <View style={pdfMagicItemCardStyles.singleCard}>
      {/* Background Image */}
      <Image src={frameUrl} style={pdfMagicItemCardStyles.backgroundImage} />

      {/* Content Overlay */}
      <View style={pdfMagicItemCardStyles.contentOverlay}>
        {/* Magic Item Name */}
        <Text style={pdfMagicItemCardStyles.itemName}>{magicItem.name}</Text>

        {/* Magic Item Image */}
        {magicItemImageUrl && (
          <View style={pdfMagicItemCardStyles.imageContainer}>
            <Image
              src={magicItemImageUrl}
              style={pdfMagicItemCardStyles.magicItemImage}
            />
          </View>
        )}

        {/* Separator */}
        <Image src={separatorUrl} style={pdfMagicItemCardStyles.separator} />

        {/* Description Section */}
        <Text
          style={pdfMagicItemCardStyles.description}
          hyphenationCallback={(word) => [word]}
        >
          {magicItem.description}
        </Text>

        {/* Traits Section - Grouped by name */}
        {Object.keys(groupedTraits).length > 0 && (
          <View style={pdfMagicItemCardStyles.traitsContainer}>
            {Object.entries(groupedTraits).map(([traitName, descriptions]) => (
              <View key={traitName} style={pdfMagicItemCardStyles.traitGroup}>
                {/* Trait Header with bar background */}
                <View style={pdfMagicItemCardStyles.traitHeaderContainer}>
                  <Image
                    src={headerBarUrl}
                    style={pdfMagicItemCardStyles.traitHeaderBar}
                  />
                  <Text style={pdfMagicItemCardStyles.traitHeaderText}>
                    {traitName}:
                  </Text>
                </View>
                {/* Trait descriptions */}
                {descriptions.map((description, idx) => (
                  <Text
                    key={idx}
                    style={pdfMagicItemCardStyles.traitDescription}
                    hyphenationCallback={(word) => [word]}
                  >
                    {description}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default {
  MAGIC_ITEM_CARD_DESIGN,
  pdfMagicItemCardStyles,
  MagicItemCardPDF,
};
