import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  itemLabel?: string;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalCount,
  itemLabel = "items",
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1 && totalCount === undefined) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-600">
      <div>
        Showing page <span className="font-semibold text-slate-800">{page}</span> of{" "}
        <span className="font-semibold text-slate-800">{Math.max(totalPages, 1)}</span>
        {totalCount !== undefined && (
          <span>
            {" "}
            ({totalCount} {itemLabel})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={disabled || page <= 1}
          className="h-8 border-slate-200 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={disabled || page >= totalPages}
          className="h-8 border-slate-200 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
