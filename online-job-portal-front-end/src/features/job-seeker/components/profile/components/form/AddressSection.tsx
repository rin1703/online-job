import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import {
  useGetDistrictsQuery,
  useGetProvincesQuery,
  useGetWardsQuery,
} from '@/redux/features/address/address.api.ts';
import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';

interface AddressSectionProps {
  location: string;
  onLocationChange: (location: string) => void;
  disabled?: boolean;
}

export default function AddressSection({
  location,
  onLocationChange,
  disabled,
}: AddressSectionProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | undefined>();
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | undefined>();
  const [selectedWardCode, setSelectedWardCode] = useState<number | undefined>();
  const [streetAddress, setStreetAddress] = useState<string>('');

  // Fetch data with error handling
  const {
    data: provinces,
    isLoading: isLoadingProvinces,
    error: provincesError,
  } = useGetProvincesQuery();

  const {
    data: districtsData,
    isLoading: isLoadingDistricts,
    error: districtsError,
  } = useGetDistrictsQuery(selectedProvinceCode!, {
    skip: !selectedProvinceCode,
  });

  const {
    data: wardsData,
    isLoading: isLoadingWards,
    error: wardsError,
  } = useGetWardsQuery(selectedDistrictCode!, {
    skip: !selectedDistrictCode,
  });

  const districts = districtsData?.districts;
  const wards = wardsData?.wards;

  /**
   * Safely parse location string into components
   * Format: "Street Address, Ward, District, Province"
   */
  const parseLocation = (locationStr: string) => {
    try {
      if (!locationStr || !locationStr.trim()) {
        return { street: '', province: '', district: '', ward: '' };
      }

      const parts = locationStr
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (parts.length === 0) {
        return { street: '', province: '', district: '', ward: '' };
      }

      // Parse from end: [...street parts], ward, district, province
      if (parts.length >= 4) {
        return {
          province: parts[parts.length - 1],
          district: parts[parts.length - 2],
          ward: parts[parts.length - 3],
          street: parts.slice(0, parts.length - 3).join(', '),
        };
      } else if (parts.length === 3) {
        // Ward, District, Province
        return {
          province: parts[2],
          district: parts[1],
          ward: parts[0],
          street: '',
        };
      } else if (parts.length === 2) {
        // District, Province
        return {
          province: parts[1],
          district: parts[0],
          ward: '',
          street: '',
        };
      } else {
        // Only Province
        return {
          province: parts[0],
          district: '',
          ward: '',
          street: '',
        };
      }
    } catch (error) {
      console.error('Error parsing location:', error);
      return { street: '', province: '', district: '', ward: '' };
    }
  };

  // Effect to parse location string and set initial state
  useEffect(() => {
    if (location && provinces) {
      const parsed = parseLocation(location);
      setStreetAddress(parsed.street);

      const province = provinces.find((p) => p.name === parsed.province);
      setSelectedProvinceCode(province?.code);
    } else if (!location) {
      // Clear all selections if location is empty
      setStreetAddress('');
      setSelectedProvinceCode(undefined);
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
    }
  }, [location, provinces]);

  // Effect to set initial district when districts data is available
  useEffect(() => {
    if (location && selectedProvinceCode && districts) {
      const parsed = parseLocation(location);
      const district = districts.find((d) => d.name === parsed.district);
      setSelectedDistrictCode(district?.code);
    }
  }, [location, selectedProvinceCode, districts]);

  // Effect to set initial ward when wards data is available
  useEffect(() => {
    if (location && selectedDistrictCode && wards) {
      const parsed = parseLocation(location);
      const ward = wards.find((w) => w.name === parsed.ward);
      setSelectedWardCode(ward?.code);
    }
  }, [location, selectedDistrictCode, wards]);

  /**
   * Format location components into a single string
   */
  const formatLocationString = (
    currentStreetAddress: string,
    currentWardCode?: number,
    currentDistrictCode?: number,
    currentProvinceCode?: number,
  ) => {
    const ward = wards?.find((w) => w.code === currentWardCode);
    const district = districts?.find((d) => d.code === currentDistrictCode);
    const province = provinces?.find((p) => p.code === currentProvinceCode);

    const addressParts = [];
    if (currentStreetAddress && currentStreetAddress.trim()) {
      addressParts.push(currentStreetAddress.trim());
    }
    if (ward) addressParts.push(ward.name);
    if (district) addressParts.push(district.name);
    if (province) addressParts.push(province.name);

    return addressParts.join(', ');
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedProvinceCode(undefined);
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
      onLocationChange(formatLocationString(streetAddress));
      return;
    }

    const code = Number(value);
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(undefined);
    setSelectedWardCode(undefined);
    onLocationChange(formatLocationString(streetAddress, undefined, undefined, code));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
      onLocationChange(formatLocationString(streetAddress, undefined, undefined, selectedProvinceCode));
      return;
    }

    const code = Number(value);
    setSelectedDistrictCode(code);
    setSelectedWardCode(undefined);
    onLocationChange(formatLocationString(streetAddress, undefined, code, selectedProvinceCode));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedWardCode(undefined);
      onLocationChange(
        formatLocationString(streetAddress, undefined, selectedDistrictCode, selectedProvinceCode),
      );
      return;
    }

    const code = Number(value);
    setSelectedWardCode(code);
    onLocationChange(
      formatLocationString(streetAddress, code, selectedDistrictCode, selectedProvinceCode),
    );
  };

  const handleStreetAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreetAddress = e.target.value;
    setStreetAddress(newStreetAddress);
    onLocationChange(
      formatLocationString(
        newStreetAddress,
        selectedWardCode,
        selectedDistrictCode,
        selectedProvinceCode,
      ),
    );
  };

  // Error display component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );

  // Styled Select component
  const StyledSelect = ({
    children,
    className = '',
    ...props
  }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
      className={`w-full px-4 py-2.5 border border-stroke rounded-lg bg-white
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
        transition-all disabled:bg-gray-100 disabled:cursor-not-allowed
        text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>Enter your complete address information</span>
      </div>

      {/* Street Address */}
      <div>
        <InputField
          id="streetAddress"
          label="Street Address"
          value={streetAddress}
          onChange={handleStreetAddressChange}
          disabled={disabled}
          placeholder="e.g., 123 Nguyen Hue Street"
        />
      </div>

      {/* Province/City Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Province/City <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <StyledSelect
            onChange={handleProvinceChange}
            value={selectedProvinceCode?.toString() || ''}
            disabled={disabled || isLoadingProvinces}
          >
            <option value="">
              {isLoadingProvinces ? 'Loading provinces...' : 'Select province/city'}
            </option>
            {provinces?.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </StyledSelect>
          {isLoadingProvinces && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {provincesError && (
          <ErrorMessage message="Failed to load provinces. Please refresh the page." />
        )}
      </div>

      {/* District Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          District {selectedProvinceCode && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <StyledSelect
            onChange={handleDistrictChange}
            value={selectedDistrictCode?.toString() || ''}
            disabled={!selectedProvinceCode || disabled || isLoadingDistricts}
          >
            <option value="">
              {!selectedProvinceCode
                ? 'Select province first'
                : isLoadingDistricts
                  ? 'Loading districts...'
                  : 'Select district'}
            </option>
            {districts?.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </StyledSelect>
          {isLoadingDistricts && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {districtsError && selectedProvinceCode && (
          <ErrorMessage message="Failed to load districts. Please try again." />
        )}
      </div>

      {/* Ward Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Ward/Commune {selectedDistrictCode && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <StyledSelect
            onChange={handleWardChange}
            value={selectedWardCode?.toString() || ''}
            disabled={!selectedDistrictCode || disabled || isLoadingWards}
          >
            <option value="">
              {!selectedDistrictCode
                ? 'Select district first'
                : isLoadingWards
                  ? 'Loading wards...'
                  : 'Select ward/commune'}
            </option>
            {wards?.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </StyledSelect>
          {isLoadingWards && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {wardsError && selectedDistrictCode && (
          <ErrorMessage message="Failed to load wards. Please try again." />
        )}
      </div>

      {/* Current Location Preview */}
      {location && location.trim() && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-1">Current Location:</p>
          <p className="text-sm text-blue-700">{location}</p>
        </div>
      )}
    </div>
  );
}
