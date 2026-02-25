"use client";

import * as React from "react";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function getHour12(date: Date) {
  const h = date.getHours();
  if (h === 0) return 12;
  if (h > 12) return h - 12;
  return h;
}

function getPeriod(date: Date): "AM" | "PM" {
  return date.getHours() < 12 ? "AM" : "PM";
}

function to24Hour(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY hh:mm aa",
  disabled,
  id,
  "aria-invalid": ariaInvalid,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;

    const result = new Date(day);
    if (draft) {
      result.setHours(draft.getHours(), draft.getMinutes(), 0, 0);
    } else {
      result.setHours(0, 0, 0, 0);
    }
    setDraft(result);
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "period",
    val: string,
  ) => {
    const base = draft ? new Date(draft) : new Date();
    if (!draft) base.setSeconds(0, 0);

    const currentHour12 = draft ? getHour12(draft) : 12;
    const currentPeriod = draft ? getPeriod(draft) : "AM";
    const currentMinute = draft ? draft.getMinutes() : 0;

    let hour12 = currentHour12;
    let period = currentPeriod;
    let minute = currentMinute;

    if (type === "hour") hour12 = parseInt(val);
    if (type === "minute") minute = parseInt(val);
    if (type === "period") period = val as "AM" | "PM";

    base.setHours(to24Hour(hour12, period), minute, 0, 0);
    setDraft(base);
  };

  const handleNow = () => {
    setDraft(new Date());
  };

  const handleSave = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="size-4 shrink-0"
          />
          {value ? format(value, "MM/dd/yyyy hh:mm aa") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={draft}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            defaultMonth={draft}
          />
          <div className="border-border flex flex-row gap-2 border-t p-3 sm:flex-col sm:border-t-0 sm:border-l">
            <Select
              value={draft ? getHour12(draft).toString() : undefined}
              onValueChange={(val) => handleTimeChange("hour", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-48">
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={draft ? draft.getMinutes().toString() : undefined}
              onValueChange={(val) => handleTimeChange("minute", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-48">
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={draft ? getPeriod(draft) : undefined}
              onValueChange={(val) => handleTimeChange("period", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2 p-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleNow}>
            Now
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
