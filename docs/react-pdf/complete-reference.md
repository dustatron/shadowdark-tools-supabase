# React-PDF Complete Reference

**Version**: 4.x
**Source**: https://react-pdf.org
**Description**: React renderer for creating PDF files on browser and server

---

## Table of Contents

1. [Components](#components)
2. [Browser Preview Components](#browser-preview-components)
3. [Styling](#styling)
4. [Fonts](#fonts)
5. [Node API](#node-api)
6. [Advanced Features](#advanced-features)

---

# Components

React-pdf follows the React primitives specification, enabling straightforward learning for developers familiar with React environments like React Native.

## Document

**Purpose:** Represents the PDF document itself; must be the root element.

**Key Constraint:** Should only contain `<Page />` children and cannot be nested within other react-pdf components.

**Valid Props:**

| Prop       | Description                  | Type       | Default     |
| ---------- | ---------------------------- | ---------- | ----------- |
| title      | Document metadata title      | String     | undefined   |
| author     | Document metadata author     | String     | undefined   |
| subject    | Document metadata subject    | String     | undefined   |
| keywords   | Associated keywords metadata | String     | undefined   |
| creator    | Creator info                 | String     | "react-pdf" |
| producer   | Producer info                | String     | "react-pdf" |
| pdfVersion | PDF version for output       | String     | "1.3"       |
| language   | Default PDF language         | String     | undefined   |
| pageMode   | Display behavior on open     | PageMode   | useNone     |
| pageLayout | How viewers display pages    | PageLayout | singlePage  |
| onRender   | Callback after rendering     | Function   | undefined   |

**PageMode Values:** useNone, useOutlines, useThumbs, fullScreen, useOC, useAttachments

**PageLayout Values:** singlePage, oneColumn, twoColumnLeft, twoColumnRight, twoPageLeft, twoPageRight

---

## Page

**Purpose:** Represents individual pages within a Document; supports page wrapping features.

**Valid Props:**

| Prop        | Description                                        | Type                       | Default    |
| ----------- | -------------------------------------------------- | -------------------------- | ---------- |
| size        | Page dimensions (string, array, number, or object) | String/Array/Number/Object | "A4"       |
| orientation | portrait or landscape                              | String                     | "portrait" |
| wrap        | Enable page wrapping                               | Boolean                    | true       |
| style       | Page styling object or array                       | Object/Array               | undefined  |
| debug       | Enable bounding box debug mode                     | Boolean                    | false      |
| dpi         | Custom DPI setting                                 | Number                     | 72         |
| id          | Destination ID for linking                         | String                     | undefined  |
| bookmark    | Attach bookmark element                            | String/Bookmark            | undefined  |

**Size Examples:**

```javascript
// Predefined sizes
<Page size="A4" />
<Page size="LETTER" />

// Custom dimensions (width x height in points)
<Page size={[400, 600]} />
<Page size={{ width: 400, height: 600 }} />
```

---

## View

**Purpose:** Fundamental building block for layout; designed for nesting with 0+ children.

**Valid Props:**

| Prop     | Description                 | Type            | Default   |
| -------- | --------------------------- | --------------- | --------- |
| wrap     | Toggle page wrapping        | Boolean         | true      |
| style    | View styling                | Object/Array    | undefined |
| render   | Dynamic content function    | Function        | undefined |
| debug    | Bounding box debugging      | Boolean         | false     |
| fixed    | Render on all wrapped pages | Boolean         | false     |
| id       | Destination ID              | String          | undefined |
| bookmark | Bookmark attachment         | String/Bookmark | undefined |

---

## Image

**Purpose:** Display JPG or PNG images, plus base64-encoded strings.

**Valid Props:**

| Prop     | Description          | Type            | Default   |
| -------- | -------------------- | --------------- | --------- |
| src      | Image source         | Source object   | undefined |
| source   | Alias for src        | Source object   | undefined |
| style    | Image styling        | Object/Array    | undefined |
| debug    | Debug bounding box   | Boolean         | false     |
| fixed    | Render on all pages  | Boolean         | false     |
| cache    | Enable image caching | Boolean         | true      |
| bookmark | Bookmark attachment  | String/Bookmark | undefined |

**Source Object Formats:**

- String: URL or filesystem path
- URL object: `{ uri, method, headers, body, credentials }`
- Buffer: Direct image rendering
- Data buffer: `{ data: Buffer, format: 'png' | 'jpg' }`
- Function: Returns any above format (can be async)

---

## Text

**Purpose:** Display text content; supports nesting of other Text or Link components for inline styling.

**Valid Props:**

| Prop                | Description              | Type            | Default   |
| ------------------- | ------------------------ | --------------- | --------- |
| wrap                | Enable page wrapping     | Boolean         | true      |
| render              | Dynamic content function | Function        | undefined |
| style               | Text styling             | Object/Array    | undefined |
| debug               | Debug mode               | Boolean         | false     |
| fixed               | Render on all pages      | Boolean         | false     |
| hyphenationCallback | Custom hyphenation logic | Function        | undefined |
| id                  | Destination ID           | String          | undefined |
| bookmark            | Bookmark attachment      | String/Bookmark | undefined |

---

## Link

**Purpose:** Create hyperlinks within documents; can nest inside Text or other primitives.

**Valid Props:**

| Prop     | Description                           | Type            | Default   |
| -------- | ------------------------------------- | --------------- | --------- |
| src      | URL or destination ID (prefix with #) | String          | undefined |
| wrap     | Enable page wrapping                  | Boolean         | true      |
| style    | Link styling                          | Object/Array    | undefined |
| debug    | Debug mode                            | Boolean         | false     |
| fixed    | Render on all pages                   | Boolean         | false     |
| bookmark | Bookmark attachment                   | String/Bookmark | undefined |

**Example:**

```javascript
// External link
<Link src="https://example.com">Visit</Link>

// Internal link to element with id
<Link src="#section2">Go to Section 2</Link>
```

---

## Note

**Purpose:** Display note annotations within documents.

**Valid Props:**

| Prop     | Description         | Type         | Default   |
| -------- | ------------------- | ------------ | --------- |
| style    | Styling             | Object/Array | undefined |
| children | Note content string | String       | undefined |
| fixed    | Render on all pages | Boolean      | false     |

---

## Canvas

**Purpose:** Enable freeform drawing using pdfkit methods.

**Valid Props:**

| Prop     | Description                            | Type            | Default   |
| -------- | -------------------------------------- | --------------- | --------- |
| style    | Canvas styling (width/height required) | Object/Array    | undefined |
| paint    | Painter function                       | Function        | undefined |
| debug    | Debug mode                             | Boolean         | false     |
| fixed    | Render on all pages                    | Boolean         | false     |
| bookmark | Bookmark attachment                    | String/Bookmark | undefined |

**Painter Function Signature:** Receives painter object, availableWidth, and availableHeight.

**Available Methods:** dash, clip, save, path, fill, font, text, rect, scale, moveTo, lineTo, stroke, rotate, circle, opacity, ellipse, polygon, restore, fontSize, fillColor, lineWidth, translate, bezierCurveTo, and 20+ additional pdfkit-compatible methods.

---

## PDFViewer (Web Only)

**Purpose:** Embedded iframe PDF viewer for client-side generated documents.

**Valid Props:**

| Prop        | Description             | Type          | Default   |
| ----------- | ----------------------- | ------------- | --------- |
| style       | Iframe styling          | Object/Array  | undefined |
| className   | CSS class name          | String        | undefined |
| children    | Document implementation | Document      | undefined |
| width       | Iframe width            | String/Number | undefined |
| height      | Iframe height           | String/Number | undefined |
| showToolbar | Display toolbar         | Boolean       | true      |

---

## PDFDownloadLink (Web Only)

**Purpose:** Anchor tag enabling on-the-fly PDF generation and download.

**Valid Props:**

| Prop      | Description             | Type              | Default   |
| --------- | ----------------------- | ----------------- | --------- |
| document  | Document implementation | Document          | undefined |
| fileName  | Downloaded filename     | String            | undefined |
| style     | Anchor styling          | Object/Array      | undefined |
| className | CSS class name          | String            | undefined |
| children  | Content or function     | DOM node/Function | undefined |

---

## BlobProvider (Web Only)

**Purpose:** Declaratively retrieve document blob data without displaying it.

**Valid Props:**

| Prop     | Description             | Type     | Default   |
| -------- | ----------------------- | -------- | --------- |
| document | Document implementation | Document | undefined |
| children | Render prop function    | Function | undefined |

**Render Prop Arguments:** blob, url, error, loading state

---

# Browser Preview Components

React-PDF provides three specialized components for browser-based PDF handling and previewing. These components work **only in the browser** (not on the server) and enable real-time PDF generation, preview, and download without backend infrastructure.

## Overview

| Component           | Purpose                 | Use Case                                    |
| ------------------- | ----------------------- | ------------------------------------------- |
| **PDFViewer**       | Embedded iframe preview | Show PDF in-page for review/preview         |
| **PDFDownloadLink** | Download trigger        | Generate and download PDF on click          |
| **BlobProvider**    | Programmatic access     | Custom handling, uploads, email attachments |

---

## PDFViewer - Embedded Preview

**Purpose:** Display a live PDF preview directly in your web page using an iframe.

### Basic Usage

```javascript
import { PDFViewer, Document, Page, Text } from "@react-pdf/renderer";

function PreviewPage() {
  return (
    <PDFViewer width="100%" height="600px">
      <Document>
        <Page>
          <Text>Live Preview</Text>
        </Page>
      </Document>
    </PDFViewer>
  );
}
```

### Props Reference

| Prop          | Type          | Default      | Description                                 |
| ------------- | ------------- | ------------ | ------------------------------------------- |
| `children`    | Document      | **required** | PDF document to render                      |
| `width`       | String/Number | undefined    | Iframe width (e.g., "100%", 800)            |
| `height`      | String/Number | undefined    | Iframe height (e.g., "600px", 600)          |
| `style`       | Object/Array  | undefined    | Iframe styling                              |
| `className`   | String        | undefined    | CSS class for iframe                        |
| `showToolbar` | Boolean       | true         | Show PDF viewer toolbar (browser-dependent) |

### Advanced Example

```javascript
import { PDFViewer } from "@react-pdf/renderer";
import { MyDocument } from "./MyDocument";

function DocumentPreview({ data }) {
  return (
    <div className="preview-container">
      <h2>Preview</h2>
      <PDFViewer
        width="100%"
        height="800px"
        showToolbar={true}
        style={{ border: "1px solid #ccc" }}
      >
        <MyDocument data={data} />
      </PDFViewer>
    </div>
  );
}
```

### Browser Compatibility

- **Toolbar support:** Chrome, Edge, Safari (varies by browser)
- **Additional props:** Pass through to underlying iframe element
- **Performance:** Re-renders when Document children change

### Best Practices

✅ **DO:**

- Use for preview/review workflows
- Set explicit width/height for consistent layout
- Wrap in loading states during initial render

❌ **DON'T:**

- Use on server-side (client-only component)
- Render multiple viewers on same page (performance)
- Assume toolbar availability across all browsers

---

## PDFDownloadLink - On-Click Download

**Purpose:** Generate and download a PDF file when user clicks a link/button.

### Basic Usage

```javascript
import { PDFDownloadLink, Document, Page, Text } from "@react-pdf/renderer";

function DownloadButton() {
  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page>
            <Text>Download me!</Text>
          </Page>
        </Document>
      }
      fileName="document.pdf"
    >
      {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
    </PDFDownloadLink>
  );
}
```

### Props Reference

| Prop        | Type          | Default      | Description                                |
| ----------- | ------------- | ------------ | ------------------------------------------ |
| `document`  | Document      | **required** | PDF document to generate                   |
| `fileName`  | String        | undefined    | Downloaded file name (e.g., "invoice.pdf") |
| `children`  | Node/Function | undefined    | Link content or render function            |
| `style`     | Object/Array  | undefined    | Anchor tag styles                          |
| `className` | String        | undefined    | CSS class for anchor                       |

### Render Function Pattern

The `children` prop can be a function receiving state information:

```javascript
<PDFDownloadLink document={<MyDocument />} fileName="report.pdf">
  {({ blob, url, loading, error }) =>
    loading ? (
      <button disabled>Generating...</button>
    ) : error ? (
      <span className="text-red-500">Error: {error}</span>
    ) : (
      <button className="btn-primary">Download Report</button>
    )
  }
</PDFDownloadLink>
```

### Styled Button Example

```javascript
function StyledDownload({ document, filename }) {
  return (
    <PDFDownloadLink
      document={document}
      fileName={filename}
      className="btn btn-primary"
      style={{
        padding: "10px 20px",
        backgroundColor: "#3b82f6",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px",
      }}
    >
      {({ loading }) => <>{loading ? "⏳ Generating..." : "⬇️ Download PDF"}</>}
    </PDFDownloadLink>
  );
}
```

### Dynamic Document Example

```javascript
function InvoiceDownload({ invoiceData }) {
  const invoice = (
    <Document>
      <Page>
        <Text>Invoice #{invoiceData.id}</Text>
        <Text>Total: ${invoiceData.total}</Text>
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink
      document={invoice}
      fileName={`invoice-${invoiceData.id}.pdf`}
    >
      {({ loading }) => (loading ? "Loading..." : "Download Invoice")}
    </PDFDownloadLink>
  );
}
```

---

## BlobProvider - Programmatic Access

**Purpose:** Access raw PDF blob data for custom handling (uploads, emails, storage).

### Basic Usage

```javascript
import { BlobProvider, Document, Page, Text } from "@react-pdf/renderer";

function BlobExample() {
  return (
    <BlobProvider
      document={
        <Document>
          <Page>
            <Text>My Document</Text>
          </Page>
        </Document>
      }
    >
      {({ blob, url, loading, error }) => {
        if (loading) return <div>Generating...</div>;
        if (error) return <div>Error: {error}</div>;

        return (
          <div>
            <p>Blob size: {blob.size} bytes</p>
            <a href={url} download="document.pdf">
              Download
            </a>
          </div>
        );
      }}
    </BlobProvider>
  );
}
```

### Props Reference

| Prop       | Type     | Default      | Description                 |
| ---------- | -------- | ------------ | --------------------------- |
| `document` | Document | **required** | PDF document to generate    |
| `children` | Function | **required** | Render prop receiving state |

### Render Function Arguments

```typescript
children({
  blob: Blob | null, // PDF blob object
  url: string | null, // Blob URL for downloads
  loading: boolean, // Generation in progress
  error: string | null, // Error message if failed
});
```

### Upload to Server Example

```javascript
function UploadPDFButton({ document }) {
  const [uploading, setUploading] = useState(false);

  async function uploadBlob(blob) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", blob, "document.pdf");

      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      alert("Uploaded successfully!");
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <BlobProvider document={document}>
      {({ blob, loading }) => (
        <button
          onClick={() => blob && uploadBlob(blob)}
          disabled={loading || uploading}
        >
          {loading
            ? "Generating..."
            : uploading
              ? "Uploading..."
              : "Upload PDF"}
        </button>
      )}
    </BlobProvider>
  );
}
```

### Email Attachment Example

```javascript
function EmailPDFButton({ document, recipient }) {
  return (
    <BlobProvider document={document}>
      {({ blob, loading }) => (
        <button
          onClick={async () => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("pdf", blob, "attachment.pdf");
            formData.append("to", recipient);

            await fetch("/api/send-email", {
              method: "POST",
              body: formData,
            });
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Email PDF"}
        </button>
      )}
    </BlobProvider>
  );
}
```

### Custom Preview with Blob URL

```javascript
function CustomPreview({ document }) {
  return (
    <BlobProvider document={document}>
      {({ url, loading, error }) => {
        if (loading) return <div>Loading preview...</div>;
        if (error) return <div>Error: {error}</div>;

        return (
          <iframe src={url} width="100%" height="600px" title="PDF Preview" />
        );
      }}
    </BlobProvider>
  );
}
```

---

## Choosing the Right Component

### Decision Tree

```
Do you need to preview the PDF in the browser?
├─ YES → Use PDFViewer (embedded iframe)
└─ NO
   ├─ Simple download button? → Use PDFDownloadLink
   └─ Need blob for custom handling? → Use BlobProvider
```

### Use Case Matrix

| Requirement                 | Component                               | Why                          |
| --------------------------- | --------------------------------------- | ---------------------------- |
| In-page preview             | **PDFViewer**                           | Built-in viewer with toolbar |
| Download button             | **PDFDownloadLink**                     | Simplest implementation      |
| Upload to server            | **BlobProvider**                        | Access to blob data          |
| Email attachment            | **BlobProvider**                        | Send blob via API            |
| Cloud storage               | **BlobProvider**                        | Upload to S3, etc.           |
| Custom UI during generation | **PDFDownloadLink** or **BlobProvider** | Render function pattern      |

---

## Performance Considerations

### Large Documents

For documents with 30+ pages:

```javascript
// Consider rendering in web worker (advanced)
import { renderToStream } from "@react-pdf/renderer";

// Or show loading state prominently
<PDFViewer>{/* Large document */}</PDFViewer>;
```

### Re-rendering

All three components re-generate the PDF when props change:

```javascript
// ❌ BAD - Regenerates on every parent render
function Parent() {
  return (
    <PDFViewer>
      <Document>
        <Page>
          <Text>Static content</Text>
        </Page>
      </Document>
    </PDFViewer>
  );
}

// ✅ GOOD - Memoize document
const MyDoc = memo(() => (
  <Document>
    <Page>
      <Text>Static content</Text>
    </Page>
  </Document>
));

function Parent() {
  return (
    <PDFViewer>
      <MyDoc />
    </PDFViewer>
  );
}
```

### Loading States

Always provide feedback during generation:

```javascript
<PDFDownloadLink document={largeDoc} fileName="large.pdf">
  {({ loading }) =>
    loading ? (
      <div className="flex items-center gap-2">
        <Spinner />
        <span>Generating PDF... This may take a moment</span>
      </div>
    ) : (
      "Download PDF"
    )
  }
</PDFDownloadLink>
```

---

## Error Handling

### Common Errors

1. **Font loading failures**

   ```javascript
   <BlobProvider document={doc}>
     {({ error }) => {
       if (error?.includes("font")) {
         return <div>Font loading error. Please refresh.</div>;
       }
       return <div>Error: {error}</div>;
     }}
   </BlobProvider>
   ```

2. **Memory issues (large docs)**

   ```javascript
   // Break into smaller chunks or use server-side rendering
   ```

3. **Browser compatibility**
   ```javascript
   if (typeof window === "undefined") {
     return <div>PDF preview not available during SSR</div>;
   }
   ```

---

## Next.js Integration

### Client Component Pattern

```typescript
'use client'; // Required for all three components

import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from './MyDocument';

export default function PDFPreview() {
  return (
    <PDFViewer width="100%" height="600px">
      <MyDocument />
    </PDFViewer>
  );
}
```

### Dynamic Import (Avoid SSR)

```typescript
// Server Component
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(() => import('./PDFPreview'), {
  ssr: false,
  loading: () => <div>Loading PDF preview...</div>
});

export default function Page() {
  return <PDFPreview />;
}
```

---

## Complete Example

Combining all three components:

```typescript
'use client';

import { useState } from 'react';
import {
  PDFViewer,
  PDFDownloadLink,
  BlobProvider,
  Document,
  Page,
  Text,
  StyleSheet
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 10 }
});

const MyDocument = ({ title }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>{title}</Text>
      <Text>Document content here...</Text>
    </Page>
  </Document>
);

export default function PDFToolkit() {
  const [title, setTitle] = useState('My Document');
  const doc = <MyDocument title={title} />;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Preview */}
      <div>
        <h2>Live Preview</h2>
        <PDFViewer width="100%" height="600px">
          {doc}
        </PDFViewer>
      </div>

      {/* Right: Controls */}
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
        />

        {/* Download */}
        <PDFDownloadLink document={doc} fileName={`${title}.pdf`}>
          {({ loading }) => loading ? 'Loading...' : 'Download'}
        </PDFDownloadLink>

        {/* Upload */}
        <BlobProvider document={doc}>
          {({ blob, loading }) => (
            <button
              onClick={() => uploadToServer(blob)}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Upload to Server'}
            </button>
          )}
        </BlobProvider>
      </div>
    </div>
  );
}
```

---

# Styling

"Because a document without styles would be very boring, react-pdf ships a powerful styling solution using CSS and Flexbox."

## StyleSheet API

### StyleSheet.create()

Creates a stylesheet object containing CSS definitions. Returns an object passable to components via the `style` prop.

**Basic Example:**

```javascript
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { backgroundColor: "tomato" },
  section: { color: "white", textAlign: "center", margin: 30 },
});

const doc = (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
    </Page>
  </Document>
);
```

### Inline Styling

Pass plain JavaScript objects directly to the `style` prop without using `StyleSheet.create()`:

```javascript
<Page size="A4" style={{ backgroundColor: "tomato" }}>
  <View style={{ color: "white", textAlign: "center", margin: 30 }}>
    <Text>Section #1</Text>
  </View>
</Page>
```

### Mixed Styling

Combine StyleSheet definitions with inline styles using arrays:

```javascript
<View style={[styles.section, { color: "white" }]}>
  <Text>Section #1</Text>
</View>
```

**Tip:** Useful for applying predefined styles alongside prop-based styles.

---

## Media Queries

Apply different styles based on document context using media queries. Supports queries for `width`, `height`, and `orientation`:

```javascript
const styles = StyleSheet.create({
  section: {
    width: 200,
    "@media max-width: 400": {
      width: 300,
    },
    "@media orientation: landscape": {
      width: 400,
    },
  },
});
```

---

## Valid Units

| Unit | Description                                    |
| ---- | ---------------------------------------------- |
| `pt` | Points (default, based on 72 dpi PDF standard) |
| `in` | Inches                                         |
| `mm` | Millimeters                                    |
| `cm` | Centimeters                                    |
| `%`  | Percentage                                     |
| `vw` | Viewport/page width                            |
| `vh` | Viewport/page height                           |

**Example:**

```javascript
const styles = StyleSheet.create({
  card: {
    width: "2.5in", // 2.5 inches
    height: "3.5in", // 3.5 inches
    padding: 10, // 10 points (default)
    margin: "5mm", // 5 millimeters
  },
});
```

---

## Valid CSS Properties

### Flexbox

alignContent, alignItems, alignSelf, flex, flexDirection, flexWrap, flexFlow, flexGrow, flexShrink, flexBasis, justifyContent, gap, rowGap, columnGap

### Layout

bottom, display, left, position, right, top, overflow, zIndex

### Dimension

height, maxHeight, maxWidth, minHeight, minWidth, width

### Color

backgroundColor, color, opacity

### Text

fontSize, fontFamily, fontStyle, fontWeight, letterSpacing, lineHeight, maxLines, textAlign, textDecoration, textDecorationColor, textDecorationStyle, textIndent, textOverflow, textTransform

### Sizing/Positioning

object-fit, object-position

### Margin/Padding

margin, marginHorizontal, marginVertical, marginTop, marginRight, marginBottom, marginLeft, padding, paddingHorizontal, paddingVertical, paddingTop, paddingRight, paddingBottom, paddingLeft

### Transformations

transform:rotate, transform:scale, transform:scaleX, transform:scaleY, transform:translate, transform:translateX, transform:translateY, transform:skew, transform:skewX, transform:skewY, transform:matrix, transformOrigin

### Borders

border, borderColor, borderStyle, borderWidth, borderTop, borderTopColor, borderTopStyle, borderTopWidth, borderRight, borderRightColor, borderRightStyle, borderRightWidth, borderBottom, borderBottomColor, borderBottomStyle, borderBottomWidth, borderLeft, borderLeftColor, borderLeftStyle, borderLeftWidth, borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius

---

# Fonts

React-pdf includes a `Font` module for loading fonts from various sources, controlling word wrapping, and defining emoji sources.

**Supported formats:** Only TTF and WOFF font files are supported.

**Built-in fonts:**

- Courier (normal, bold, oblique, bold oblique)
- Helvetica (normal, bold, oblique, bold oblique)
- Times-Roman (normal, bold, italic, bold italic)

---

## Font.register()

Registers custom font files from various sources.

```javascript
import { Font } from '@react-pdf/renderer'

Font.register({
  family: 'FamilyName',
  src: source,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fonts?: []
});
```

### Parameters

**`source`** (string)

- A valid URL or absolute file path (Node.js environments)

**`family`** (string)

- Unique name to reference the font in style definitions

**`fontStyle`** (string)

- `normal` (default) - standard font
- `italic` - italic version required; react-pdf will fail if unavailable
- `oblique` - oblique version required; react-pdf will fail if unavailable

**`fontWeight`** (string or number)

- Named values: `thin` (100), `ultralight` (200), `light` (300), `normal` (400, default), `medium` (500), `semibold` (600), `bold` (700), `ultrabold` (800), `heavy` (900)
- Integer values: 0-1000
- Falls back to nearest registered weight when exact match unavailable

**`fonts`** (array, optional)
Register multiple font variants simultaneously:

```javascript
Font.register({
  family: "Roboto",
  fonts: [
    { src: source1 }, // normal, normal
    { src: source2, fontStyle: "italic" },
    { src: source3, fontStyle: "italic", fontWeight: 700 },
  ],
});
```

### Usage Example

```javascript
import { StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: source,
});

const styles = StyleSheet.create({
  title: {
    fontFamily: "Roboto",
  },
});
```

---

## Font.registerHyphenationCallback()

Provides fine-grained control over word breaking behavior.

```javascript
import { Font } from "@react-pdf/renderer";

const hyphenationCallback = (word) => {
  // Return word parts in an array
};

Font.registerHyphenationCallback(hyphenationCallback);
```

### Parameters

**`hyphenationCallback`** (function)

- Receives a word string
- Returns an array of word parts/syllables

### Disable Hyphenation

```javascript
Font.registerHyphenationCallback((word) => [word]);
```

---

## Font.registerEmojiSource()

Enables emoji rendering by embedding images from a CDN. "PDF documents do not support color emoji fonts," so react-pdf embeds them as images instead.

```javascript
import { Font } from "@react-pdf/renderer";

Font.registerEmojiSource({
  format: "png",
  url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/",
});
```

### Parameters

**`format`** (string)

- Image format (e.g., 'png')

**`url`** (string)

- CDN base URL for emoji images
- Recommended: [Twemoji](https://github.com/twitter/twemoji)

### Important Note

"React-pdf will need a internet connection to download emoji's images at render time," so plan accordingly in offline contexts.

---

# Node API

## renderToFile

**Description:** Helper function to render a PDF into a file.

**Usage:**

```javascript
const MyDocument = () => (
  <Document>
    <Page>
      <Text>React-pdf</Text>
    </Page>
  </Document>
);

await renderToFile(<MyDocument />, `${__dirname}/my-doc.pdf`);
```

**Parameters:**

| Parameter | Description                                         | Default   |
| --------- | --------------------------------------------------- | --------- |
| document  | Document's root element to be rendered              | undefined |
| path      | File system path where the document will be created | undefined |
| callback  | Function to be called after rendering is finished   | undefined |

---

## renderToString

**Description:** Helper function to render a PDF into a string.

**Usage:**

```javascript
const MyDocument = () => (
  <Document>
    <Page>
      <Text>React-pdf</Text>
    </Page>
  </Document>
);

const value = await renderToString(<MyDocument />);
```

**Parameters:**

| Parameter | Description                            | Default   |
| --------- | -------------------------------------- | --------- |
| document  | Document's root element to be rendered | undefined |

**Returns:** String representation of PDF document

---

## renderToStream

**Description:** Helper function to render a PDF into a Node Stream.

**Usage:**

```javascript
const MyDocument = () => (
  <Document>
    <Page>
      <Text>React-pdf</Text>
    </Page>
  </Document>
);

const stream = await renderToStream(<MyDocument />);
```

**Parameters:**

| Parameter | Description                            | Default   |
| --------- | -------------------------------------- | --------- |
| document  | Document's root element to be rendered | undefined |

**Returns:** PDF document Stream

---

## renderToBuffer

**Note:** Not documented on the website, but available in the package.

**Usage:**

```javascript
import { renderToBuffer } from "@react-pdf/renderer";

const buffer = await renderToBuffer(<MyDocument />);
```

**Returns:** Buffer containing PDF data (useful for Next.js API routes)

---

# Advanced Features

## Page Wrapping

The `<Page />` component represents a single page, but React-pdf includes built-in wrapping that automatically creates page breaks when content exceeds limits. This is enabled by default but can be disabled:

```javascript
<Page wrap={false}>// content here</Page>
```

### Breakable vs. Unbreakable Components

Two component types exist based on wrapping behavior:

- **Breakable components** fill remaining space before moving to the next page. Includes View, Text, and Link by default.
- **Unbreakable components** render entirely on the following page if insufficient space exists. Image components fall into this category.

Transform breakable elements into unbreakable ones using `wrap={false}`:

```javascript
<View wrap={false}>// content here</View>
```

### Page Breaks

Force new pages by adding the `break` prop to any primitive:

```javascript
<Text break>// content here</Text>
```

### Fixed Components

Render components across all pages using the `fixed` prop—useful for headers, footers, and page numbers:

```javascript
<View fixed>// appears on every page</View>
```

---

## Document Navigation

### Destinations (v2.0.0)

Create interactive links using `id` on elements and `src="#id"` on Link components:

```javascript
<Link src='#Footnote'>Click me</Link>
// Later...
<Text id='Footnote'>Destination content</Text>
```

### Bookmarks (v2.2.0)

Build navigable table of contents hierarchies:

```javascript
<Page bookmark="Book Title">
  <Text bookmark={{ title: "Chapter 1", fit: true }}>Content</Text>
</Page>
```

Bookmark objects support: `title`, `top`, `left`, `zoom`, `fit`, and `expanded` properties.

---

## On-the-Fly Rendering (Web Only)

### Download Links

```javascript
<PDFDownloadLink document={<MyDoc />} fileName="file.pdf">
  {({ loading }) => (loading ? "Loading..." : "Download")}
</PDFDownloadLink>
```

### Blob Access

```javascript
<BlobProvider document={MyDoc}>
  {({ blob, url, loading, error }) => (
    // Access blob data here
  )}
</BlobProvider>
```

### usePDF Hook

Access document state and trigger re-rendering:

```javascript
const [instance, updateInstance] = usePDF({ document: MyDoc });
```

---

## Orphan & Widow Protection

Control text layout across page breaks with these props:

| Prop             | Description                               | Type    | Default |
| ---------------- | ----------------------------------------- | ------- | ------- |
| minPresenceAhead | Points before page break between siblings | Integer | 0       |
| orphans          | Minimum lines at page bottom              | Integer | 2       |
| widows           | Minimum lines at page top                 | Integer | 2       |

---

## Dynamic Content

Render conditional content based on page context:

```javascript
<Text
  render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
  fixed
/>
```

Available arguments: `pageNumber`, `totalPages`, `subPageNumber`, `subPageTotalPages`.

---

## Debugging

Enable layout visualization:

```javascript
<View debug={true}>// Layout boxes display on render</View>
```

---

## Hyphenation

React-pdf implements the Knuth-Plass line breaking algorithm for English by default. Register custom hyphenation callbacks:

```javascript
Font.registerHyphenationCallback((word) => {
  // Return word syllables as array
});
```

---

## Large Documents

For 30+ page documents in browsers, "render inside web workers to avoid blocking the main thread and maintain UI responsiveness."

---

# Common Patterns

## Standard Document Template

```javascript
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 10,
  },
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Document Title</Text>
      <View style={styles.section}>
        <Text>Section content</Text>
      </View>
    </Page>
  </Document>
);
```

---

## Server-Side Rendering (Next.js API Route)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { MyDocument } from './MyDocument';

export async function GET(request: NextRequest) {
  const buffer = await renderToBuffer(<MyDocument />);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
    },
  });
}
```

---

## Custom Card Dimensions

```javascript
const styles = StyleSheet.create({
  page: {
    // Custom page size: 2.5" x 3.5" (poker card)
    width: "2.5in",
    height: "3.5in",
  },
  card: {
    border: "3pt solid #000",
    padding: 2,
    width: "100%",
    height: "100%",
  },
});

<Page size={{ width: 180, height: 252 }} style={styles.page}>
  <View style={styles.card}>
    <Text>Card Content</Text>
  </View>
</Page>;
```

**Note:** 1 inch = 72 points, so 2.5" = 180pt, 3.5" = 252pt

---

# Resources

- **Official Documentation**: https://react-pdf.org
- **GitHub Repository**: https://github.com/diegomura/react-pdf
- **Interactive Playground**: https://react-pdf.org/repl
- **NPM Package**: https://www.npmjs.com/package/@react-pdf/renderer
