"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { useTranslation } from "react-i18next";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  keyExtractor: (row: T) => string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  className?: string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage,
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor,
  pagination,
  className,
}: TableProps<T>) {
  const { t } = useTranslation();

  const renderSkeleton = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={`sk-${i}`} className="border-b">
        {columns.map((_, ci) => (
          <td key={ci} className="px-4 py-3">
            <Skeleton className="h-4 w-full" />
          </td>
        ))}
      </tr>
    ));

  const renderEmpty = () => (
    <tr>
      <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
        {emptyMessage || t("table.noData")}
      </td>
    </tr>
  );

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-muted-foreground",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                    col.width
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortColumn === col.key && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? renderSkeleton() : data.length === 0 ? renderEmpty() : data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.cell ? col.cell(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {t("table.showing")} {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t("table.of")} {pagination.total}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label={t("common.previous")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {pagination.page} {t("table.of")} {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              aria-label={t("common.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
