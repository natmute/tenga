import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

export interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
}

interface FilterSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  maxPrice?: number;
}

const allColors = ['Black', 'White', 'Gray', 'Navy', 'Cream', 'Tortoise', 'Pink', 'Sage', 'Charcoal', 'Blush', 'Ocean', 'Wood', 'Space Gray'];
const allSizes = ['S', 'M', 'L', 'XL', '7', '8', '9', '10', '11', '12', '41mm', '45mm'];

const FilterSheet = ({ filters, onFiltersChange, maxPrice = 500 }: FilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.categories, category]
      : localFilters.categories.filter(c => c !== category);
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...localFilters.colors, color]
      : localFilters.colors.filter(c => c !== color);
    setLocalFilters({ ...localFilters, colors: newColors });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...localFilters.sizes, size]
      : localFilters.sizes.filter(s => s !== size);
    setLocalFilters({ ...localFilters, sizes: newSizes });
  };

  const handlePriceChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, priceRange: [value[0], value[1]] });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [0, maxPrice],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={localFilters.categories.includes(category.name)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.name, checked as boolean)
                    }
                  />
                  <span className="text-sm">{category.icon} {category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-medium mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    handleColorChange(color, !localFilters.colors.includes(color))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-all",
                    localFilters.colors.includes(color)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-medium mb-3">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    handleSizeChange(size, !localFilters.sizes.includes(size))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all min-w-[48px] text-center",
                    localFilters.sizes.includes(size)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="px-2">
              <Slider
                value={localFilters.priceRange}
                onValueChange={handlePriceChange}
                max={maxPrice}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${localFilters.priceRange[0]}</span>
                <span>${localFilters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-gradient-primary">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
