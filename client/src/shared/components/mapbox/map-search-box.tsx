"use client";

import { useRef, useState } from "react";
import { useMapboxSearch } from "@/shared/hooks/use-mapbox-search";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/shared/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Loading03Icon, MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";

interface MapSearchBoxProps {
  onSelect: (coordinates: [number, number], placeName: string) => void;
  className?: string;
}

export function MapSearchBox({ onSelect, className }: MapSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { results, isLoading } = useMapboxSearch(query);

  const showDropdown = isFocused && query.trim().length >= 3;

  const handleSelect = (coordinates: [number, number], placeName: string) => {
    onSelect(coordinates, placeName);
    setQuery("");
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <InputGroup className="bg-background/95 shadow-md backdrop-blur-sm">
        <InputGroupAddon align="inline-start">
          {isLoading ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="text-muted-foreground size-4 animate-spin"
            />
          ) : (
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="text-muted-foreground size-4"
            />
          )}
        </InputGroupAddon>
        <Input
          ref={inputRef}
          data-slot="input-group-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search location…"
          autoComplete="off"
          className="rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent"
        />
      </InputGroup>

      {showDropdown && (
        <div className="bg-popover text-popover-foreground ring-foreground/10 absolute top-full mt-1.5 w-full overflow-hidden rounded-lg shadow-md ring-1">
          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(result.coordinates, result.placeName)}
                  >
                    <HugeiconsIcon
                      icon={MapsLocation01Icon}
                      strokeWidth={1.5}
                      className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    />
                    <span className="line-clamp-2 min-w-0">{result.placeName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : !isLoading ? (
            <p className="text-muted-foreground px-3 py-3 text-center text-sm">No results found</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
