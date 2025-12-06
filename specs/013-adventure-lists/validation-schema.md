# Adventure Lists Validation Schema

## Overview

This document defines the validation schemas for the Adventure Lists feature. These schemas will be used to validate user input when creating or updating adventure lists and list items.

## Schemas

### Adventure List Schema

```typescript
import { z } from "zod";

export const adventureListSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .nullable()
    .optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL must be 500 characters or less")
    .nullable()
    .optional(),
  is_public: z.boolean().default(false),
});

export type AdventureListInput = z.infer<typeof adventureListSchema>;
```

### Adventure List Item Schema

```typescript
import { z } from "zod";

export const adventureListItemSchema = z.object({
  item_type: z.enum(["monster", "spell", "magic_item"], {
    errorMap: () => ({ message: "Invalid item type" }),
  }),
  item_id: z.string().uuid("Invalid item ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity must be 99 or less")
    .default(1),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .nullable()
    .optional(),
});

export type AdventureListItemInput = z.infer<typeof adventureListItemSchema>;
```

### Adventure List Item Update Schema

```typescript
import { z } from "zod";

export const adventureListItemUpdateSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity must be 99 or less")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .nullable()
    .optional(),
});

export type AdventureListItemUpdateInput = z.infer<
  typeof adventureListItemUpdateSchema
>;
```

## Usage Examples

### Validating Adventure List Creation

```typescript
import { adventureListSchema } from "@/lib/validations/adventure-lists";

async function createAdventureList(formData: FormData) {
  try {
    // Parse and validate the form data
    const validatedData = adventureListSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      notes: formData.get("notes"),
      image_url: formData.get("image_url"),
      is_public: formData.get("is_public") === "true",
    });

    // Proceed with creating the adventure list
    const response = await fetch("/api/adventure-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to create adventure list");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return {
        success: false,
        errors: error.errors,
      };
    }
    throw error;
  }
}
```

### Validating Adventure List Item Addition

```typescript
import { adventureListItemSchema } from "@/lib/validations/adventure-lists";

async function addItemToList(listId: string, itemData: unknown) {
  try {
    // Parse and validate the item data
    const validatedData = adventureListItemSchema.parse(itemData);

    // Proceed with adding the item to the list
    const response = await fetch(`/api/adventure-lists/${listId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to add item to list");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return {
        success: false,
        errors: error.errors,
      };
    }
    throw error;
  }
}
```

## Server-Side Validation

The same schemas should be used on the server side to validate incoming requests:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { adventureListSchema } from "@/lib/validations/adventure-lists";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const validatedData = adventureListSchema.parse(body);

    // Process the validated data
    // ...

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating adventure list:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## Form Validation with React Hook Form

These schemas can be integrated with React Hook Form for client-side validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adventureListSchema, AdventureListInput } from "@/lib/validations/adventure-lists";

export function AdventureListForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdventureListInput>({
    resolver: zodResolver(adventureListSchema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
      image_url: "",
      is_public: false,
    },
  });

  const onSubmit = async (data: AdventureListInput) => {
    // Submit the form data
    // ...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" {...register("title")} />
        {errors.title && <p>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register("description")} />
        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" {...register("notes")} />
        {errors.notes && <p>{errors.notes.message}</p>}
      </div>

      <div>
        <label htmlFor="image_url">Image URL</label>
        <input id="image_url" {...register("image_url")} />
        {errors.image_url && <p>{errors.image_url.message}</p>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("is_public")} />
          Make this list public
        </label>
      </div>

      <button type="submit">Save List</button>
    </form>
  );
}
```

## Conclusion

These validation schemas ensure that all data related to adventure lists and their items is properly validated before being processed or stored in the database. By using the same schemas on both the client and server sides, we maintain consistency and prevent invalid data from entering the system.
