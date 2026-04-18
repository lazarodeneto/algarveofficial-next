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

// Multiple countries share the same dial code (e.g. US and CA both use "+1",
// KZ and RU both use "+7"). Radix Select uses the `value` prop as a unique
// identifier, so we use "ISO_CODE|dialCode" internally and strip it in the
// callback so the public API stays as a plain dial code string.
function toInternalValue(code: string, dialCode: string) {
  return `${code}|${dialCode}`;
}

function dialCodeFromInternalValue(value: string) {
  return value.includes("|") ? value.split("|")[1] : value;
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

  // Derive unique internal value from the external dial code.
  // When multiple countries share a dial code, the first in priority order wins.
  const matchedCountry = countries.find((c) => c.dialCode === countryCode);
  const internalValue = matchedCountry
    ? toInternalValue(matchedCountry.code, matchedCountry.dialCode)
    : countryCode;

  const selectedCountry = countries.find(
    (c) => toInternalValue(c.code, c.dialCode) === internalValue
  );

  const handleCountryChange = (value: string) => {
    onCountryCodeChange(dialCodeFromInternalValue(value));
  };

  return (
    <div className={className ?? "flex gap-3"}>
      <Select value={internalValue} onValueChange={handleCountryChange}>
        <SelectTrigger className={cn(compactTrigger ? "w-[74px] justify-center px-2" : "w-[170px]")}>
          {compactTrigger ? (
            <>
              <span className="text-base leading-none" aria-hidden="true">
                {selectedCountry?.flag ?? "🌐"}
              </span>
              <span className="sr-only">
                {selectedCountry
                  ? `${selectedCountry.name} ${selectedCountry.dialCode}`
                  : countryCode}
              </span>
            </>
          ) : (
            <SelectValue placeholder="+351" />
          )}
        </SelectTrigger>
        <SelectContent className={cn("max-h-72", compactTrigger ? "min-w-[250px]" : undefined)}>
          {countries.map((country) => {
            const itemValue = toInternalValue(country.code, country.dialCode);
            return (
              <SelectItem key={itemValue} value={itemValue}>
                <span className="inline-flex w-full items-center gap-2">
                  <span className="text-base leading-none" aria-hidden="true">
                    {country.flag}
                  </span>
                  <span className="truncate">{country.name}</span>
                  <span className="ml-auto text-muted-foreground">{country.dialCode}</span>
                </span>
              </SelectItem>
            );
          })}
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
