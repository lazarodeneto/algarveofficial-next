
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterState {
    priceMin: string;
    priceMax: string;
    type: string;
    beds: string;
    location: string;
}

interface RealEstateFiltersProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
    onSearch: () => void;
    onClear: () => void;
}

export function RealEstateFilters({ filters, onFilterChange, onSearch, onClear }: RealEstateFiltersProps) {
    return (
        <div className="bg-card p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-lg shadow-black/[0.02] border border-border/50 space-y-6">
            <div className="space-y-2">
                <h3 className="font-serif text-lg font-medium">Refine Search</h3>
                <Separator />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="City or Region"
                            className="pl-9"
                            value={filters.location}
                            onChange={(e) => onFilterChange("location", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={filters.type} onValueChange={(val) => onFilterChange("type", val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Type</SelectItem>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder="Min €"
                            value={filters.priceMin}
                            onChange={(e) => onFilterChange("priceMin", e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Max €"
                            value={filters.priceMax}
                            onChange={(e) => onFilterChange("priceMax", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label>Bedrooms</Label>
                        <Select value={filters.beds} onValueChange={(val) => onFilterChange("beds", val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any</SelectItem>
                                <SelectItem value="1">1+</SelectItem>
                                <SelectItem value="2">2+</SelectItem>
                                <SelectItem value="3">3+</SelectItem>
                                <SelectItem value="4">4+</SelectItem>
                                <SelectItem value="5">5+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-2 space-y-2">
                    <Button className="w-full" onClick={onSearch}>Search Properties</Button>
                    <Button variant="outline" className="w-full" onClick={onClear}>
                        <X className="w-4 h-4 mr-2" /> Clear Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
