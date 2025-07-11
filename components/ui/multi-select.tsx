"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectProps {
  options: { label: string; value: number }[];
  selected: number[];
  onSelectedChange: (value: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectedChange,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: number) => {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((item) => item !== value))
    } else {
      onSelectedChange([...selected, value])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectedChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[38px]"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return option ? (
                  <Badge key={value} variant="secondary" className="flex items-center gap-1">
                    {option.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(value);
                      }}
                    />
                  </Badge>
                ) : null;
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    handleSelect(option.value);
                    // setOpen(false);
                  }}
                >
                  <Check
                    className={
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    }
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
