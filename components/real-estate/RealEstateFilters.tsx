
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    return (
        <div className="bg-card p-4 sm:p-6 rounded-sm sm:rounded-lg shadow-lg shadow-black/[0.02] border border-border/50 space-y-6">
            <div className="space-y-2">
                <h3 className="font-serif text-lg font-medium">{t("categoryLayouts.realEstate.filters.refineSearch")}</h3>
                <Separator />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>{t("categoryLayouts.realEstate.filters.location")}</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("categoryLayouts.realEstate.filters.cityOrRegion")}
                            className="pl-9"
                            value={filters.location}
                            onChange={(e) => onFilterChange("location", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t("categoryLayouts.realEstate.filters.propertyType")}</Label>
                    <Select value={filters.type} onValueChange={(val) => onFilterChange("type", val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("categoryLayouts.realEstate.filters.anyType")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("categoryLayouts.realEstate.filters.anyType")}</SelectItem>
                            <SelectItem value="Villa">{t("categoryLayouts.realEstate.filters.propertyTypes.villa")}</SelectItem>
                            <SelectItem value="Apartment">{t("categoryLayouts.realEstate.filters.propertyTypes.apartment")}</SelectItem>
                            <SelectItem value="Townhouse">{t("categoryLayouts.realEstate.filters.propertyTypes.townhouse")}</SelectItem>
                            <SelectItem value="Land">{t("categoryLayouts.realEstate.filters.propertyTypes.land")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>{t("categoryLayouts.realEstate.filters.priceRange")}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder={t("categoryLayouts.realEstate.filters.minPrice")}
                            value={filters.priceMin}
                            onChange={(e) => onFilterChange("priceMin", e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder={t("categoryLayouts.realEstate.filters.maxPrice")}
                            value={filters.priceMax}
                            onChange={(e) => onFilterChange("priceMax", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label>{t("categoryLayouts.realEstate.filters.bedrooms")}</Label>
                        <Select value={filters.beds} onValueChange={(val) => onFilterChange("beds", val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("categoryLayouts.realEstate.filters.any")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("categoryLayouts.realEstate.filters.any")}</SelectItem>
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
                    <Button className="w-full" onClick={onSearch}>{t("categoryLayouts.realEstate.filters.searchProperties")}</Button>
                    <Button variant="outline" className="w-full" onClick={onClear}>
                        <X className="w-4 h-4 mr-2" /> {t("categoryLayouts.realEstate.filters.clearFilters")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
