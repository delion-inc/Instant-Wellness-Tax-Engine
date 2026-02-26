import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons";

const PAGE_SIZES = [25, 50, 100] as const;

interface OrdersPaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number, pageSize?: number) => void;
}

export function OrdersPagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: OrdersPaginationProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="text-foreground font-medium">{from}</span>
        {" - "}
        <span className="text-foreground font-medium">{to}</span>
        {" of "}
        <span className="text-foreground font-medium">
          {totalElements?.toLocaleString()}
        </span>
      </p>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="page-size-select" className="text-sm font-medium whitespace-nowrap">
            Rows per page
          </Label>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageChange(0, Number(val))}
          >
            <SelectTrigger size="sm" className="w-20" id="page-size-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm font-medium whitespace-nowrap">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={!hasPrevious}
          >
            <span className="sr-only">First page</span>
            <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevious}
          >
            <span className="sr-only">Previous page</span>
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <span className="sr-only">Next page</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={!hasNext}
          >
            <span className="sr-only">Last page</span>
            <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
