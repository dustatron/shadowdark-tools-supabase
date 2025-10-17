"use client";

import {
  Pagination as MantinePagination,
  Group,
  Text,
  Select,
} from "@mantine/core";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Group justify="space-between" align="center">
      <Group>
        <Text size="sm" c="dimmed">
          Showing {startItem}-{endItem} of {totalItems} items
        </Text>
        {onPageSizeChange && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Items per page:
            </Text>
            <Select
              size="xs"
              value={pageSize.toString()}
              onChange={(value) => onPageSizeChange(parseInt(value || "20"))}
              data={pageSizeOptions.map((option) => ({
                value: option.toString(),
                label: option.toString(),
              }))}
              w={80}
            />
          </Group>
        )}
      </Group>

      {totalPages > 1 && (
        <MantinePagination
          value={currentPage}
          onChange={onPageChange}
          total={totalPages}
          size="sm"
          withEdges
        />
      )}
    </Group>
  );
}
