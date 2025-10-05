import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Données des pays les plus utilisés
const COUNTRIES = [{
  code: "GA",
  name: "Gabon",
  dialCode: "+241",
  flag: "🇬🇦"
}, {
  code: "CM",
  name: "Cameroun",
  dialCode: "+237",
  flag: "🇨🇲"
}, {
  code: "FR",
  name: "France",
  dialCode: "+33",
  flag: "🇫🇷"
}, {
  code: "CI",
  name: "Côte d'Ivoire",
  dialCode: "+225",
  flag: "🇨🇮"
}, {
  code: "SN",
  name: "Sénégal",
  dialCode: "+221",
  flag: "🇸🇳"
}, {
  code: "MA",
  name: "Maroc",
  dialCode: "+212",
  flag: "🇲🇦"
}, {
  code: "DZ",
  name: "Algérie",
  dialCode: "+213",
  flag: "🇩🇿"
}, {
  code: "TN",
  name: "Tunisie",
  dialCode: "+216",
  flag: "🇹🇳"
}, {
  code: "CD",
  name: "RD Congo",
  dialCode: "+243",
  flag: "🇨🇩"
}, {
  code: "BF",
  name: "Burkina Faso",
  dialCode: "+226",
  flag: "🇧🇫"
}, {
  code: "ML",
  name: "Mali",
  dialCode: "+223",
  flag: "🇲🇱"
}, {
  code: "NE",
  name: "Niger",
  dialCode: "+227",
  flag: "🇳🇪"
}, {
  code: "TD",
  name: "Tchad",
  dialCode: "+235",
  flag: "🇹🇩"
}, {
  code: "MG",
  name: "Madagascar",
  dialCode: "+261",
  flag: "🇲🇬"
}, {
  code: "US",
  name: "États-Unis",
  dialCode: "+1",
  flag: "🇺🇸"
}, {
  code: "CA",
  name: "Canada",
  dialCode: "+1",
  flag: "🇨🇦"
}, {
  code: "GB",
  name: "Royaume-Uni",
  dialCode: "+44",
  flag: "🇬🇧"
}, {
  code: "DE",
  name: "Allemagne",
  dialCode: "+49",
  flag: "🇩🇪"
}, {
  code: "ES",
  name: "Espagne",
  dialCode: "+34",
  flag: "🇪🇸"
}, {
  code: "IT",
  name: "Italie",
  dialCode: "+39",
  flag: "🇮🇹"
}, {
  code: "BE",
  name: "Belgique",
  dialCode: "+32",
  flag: "🇧🇪"
}, {
  code: "CH",
  name: "Suisse",
  dialCode: "+41",
  flag: "🇨🇭"
}];
interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
}
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({
  value = "",
  onChange,
  disabled,
  placeholder,
  className,
  required
}, ref) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Gabon par défaut
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour détecter le pays à partir de l'indicatif
  const detectCountryFromDialCode = (dialCode: string) => {
    return COUNTRIES.find(country => country.dialCode === dialCode || dialCode.startsWith(country.dialCode)) || COUNTRIES[0];
  };

  // Gérer les changements de numéro complet
  const handleFullNumberChange = (fullNumber: string) => {
    // Si on commence par +, on essaie de détecter le pays
    if (fullNumber.startsWith('+')) {
      const detectedCountry = detectCountryFromDialCode(fullNumber.substring(0, 4));
      if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
        setSelectedCountry(detectedCountry);
        const numberWithoutDialCode = fullNumber.replace(detectedCountry.dialCode, '');
        setPhoneNumber(numberWithoutDialCode);
        onChange?.(fullNumber);
        return;
      }
    }

    // Sinon, on considère que c'est juste le numéro local
    const cleanNumber = fullNumber.replace(/^\+/, '').replace(selectedCountry.dialCode.replace('+', ''), '');
    setPhoneNumber(cleanNumber);
    const completeNumber = selectedCountry.dialCode + cleanNumber;
    onChange?.(completeNumber);
  };

  // Gérer les changements de pays
  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const completeNumber = country.dialCode + phoneNumber;
      onChange?.(completeNumber);
      setIsOpen(false);
    }
  };

  // Gérer les changements de numéro local
  const handleLocalNumberChange = (localNumber: string) => {
    setPhoneNumber(localNumber);
    const completeNumber = selectedCountry.dialCode + localNumber;
    onChange?.(completeNumber);
  };
  return <div className={cn("flex", className)}>
        {/* Sélecteur de pays */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-r-none border-r-0 px-3 flex items-center gap-2 min-w-[100px]" disabled={disabled}>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-mono">{selectedCountry.dialCode}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80" align="start">
            <div className="max-h-60 overflow-y-auto">
              {COUNTRIES.map(country => <Button key={country.code} variant="ghost" className="w-full justify-start gap-3 rounded-none h-12" onClick={() => handleCountryChange(country.code)}>
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{country.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{country.dialCode}</span>
                  </div>
                </Button>)}
            </div>
          </PopoverContent>
        </Popover>

        {/* Input du numéro */}
        <Input ref={ref} type="tel" placeholder={placeholder || "Numéro de téléphone"} value={phoneNumber} onChange={e => handleLocalNumberChange(e.target.value)} disabled={disabled} required={required} className="rounded-l-none bg-white" />
      </div>;
});
PhoneInput.displayName = "PhoneInput";