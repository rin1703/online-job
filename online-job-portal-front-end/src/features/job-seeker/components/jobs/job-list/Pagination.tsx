"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span> -
        <span className="font-semibold text-foreground"> {endItem}</span> of
        <span className="font-semibold text-foreground"> {totalItems}</span>
      </div>

      <div className="flex items-center gap-2">
        <ButtonLowercase
          variant={"outline"}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-4 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </ButtonLowercase>

        {pageNumbers.map((page, index) => (
          <ButtonLowercase
            variant={"outline"}
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-4 py-2 rounded-lg transition ${
              page === currentPage
                ? "bg-primary text-primary-foreground font-semibold"
                : page === "..."
                  ? "cursor-default text-muted-foreground"
                  : "border border-border hover:bg-secondary text-foreground"
            }`}
          >
            {page}
          </ButtonLowercase>
        ))}

        <ButtonLowercase
          variant={"outline"}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-4 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </ButtonLowercase>
      </div>
    </div>
  );
}
