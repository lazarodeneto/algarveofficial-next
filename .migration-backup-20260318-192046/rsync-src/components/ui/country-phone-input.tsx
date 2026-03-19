"use client";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountryDialCodes } from "@/hooks/useCountryDialCodes";
import { cn } from "@/lib/utils";

interface CountryPhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  phonePlaceholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  compactTrigger?: boolean;
}

export function CountryPhoneInput({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  phonePlaceholder = "Phone number",
  required,
  className,
  inputClassName,
  compactTrigger = true,
}: CountryPhoneInputProps) {
  const { data: countries = [] } = useCountryDialCodes();
  const selectedCountry = countries.find((country) => country.dialCode === countryCode);

  return (
    <div className={className ?? "flex gap-3"}>
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger className={cn(compactTrigger ? "w-[74px] justify-center px-2" : "w-[170px]")}>
          {compactTrigger ? (
            <>
              <span className="text-base leading-none" aria-hidden="true">
                {selectedCountry?.flag ?? "🌐"}
              </span>
              <span className="sr-only">
                {selectedCountry ? `${selectedCountry.name} ${selectedCountry.dialCode}` : countryCode}
              </span>
            </>
          ) : (
            <SelectValue placeholder="+351" />
          )}
        </SelectTrigger>
        <SelectContent className={cn("max-h-72", compactTrigger ? "min-w-[250px]" : undefined)}>
          {countries.map((country) => (
            <SelectItem key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
              <span className="inline-flex w-full items-center gap-2">
                <span className="text-base leading-none" aria-hidden="true">
                  {country.flag}
                </span>
                <span className="truncate">{country.name}</span>
                <span className="ml-auto text-muted-foreground">{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          required={required}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={phonePlaceholder}
          className={inputClassName ?? "pl-9"}
        />
      </div>
    </div>
  );
}
