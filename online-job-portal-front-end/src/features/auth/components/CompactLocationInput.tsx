import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } from '@/redux/features/address/address.api';

interface CompactLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CompactLocationInput: React.FC<CompactLocationInputProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null);

  // Parse location string to extract ward, district, province
  const parseLocation = (locationStr: string) => {
    const parts = locationStr.split(',').map(p => p.trim());
    return {
      ward: parts[0] || '',
      district: parts[1] || '',
      province: parts[2] || '',
    };
  };

  const { ward, district, province } = parseLocation(value);

  // Fetch provinces
  const { data: provinces = [] } = useGetProvincesQuery();

  // Fetch districts based on selected province
  const { data: districtData } = useGetDistrictsQuery(selectedProvinceCode!, {
    skip: !selectedProvinceCode,
  });

  // Fetch wards based on selected district
  const { data: wardData } = useGetWardsQuery(selectedDistrictCode!, {
    skip: !selectedDistrictCode,
  });

  const districts = districtData?.districts || [];
  const wards = wardData?.wards || [];

  const handleProvinceChange = (provinceCode: string) => {
    const code = parseInt(provinceCode, 10);
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    onChange('');
  };

  const handleDistrictChange = (districtCode: string) => {
    const code = parseInt(districtCode, 10);
    setSelectedDistrictCode(code);
    setSelectedWardCode(null);
    onChange('');
  };

  const handleWardChange = (wardCode: string, wardName: string) => {
    const code = parseInt(wardCode, 10);
    setSelectedWardCode(code);

    const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
    const selectedDistrict = districts.find(d => d.code === selectedDistrictCode);

    if (selectedDistrict && selectedProvince && wardName) {
      onChange(`${wardName}, ${selectedDistrict.name}, ${selectedProvince.name}`);
    }
  };

  return (
    <div className="space-y-2">
      <style>{`
        @media (max-width: 640px) {
          .location-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="location-grid grid grid-cols-3 gap-2">
        {/* Province Select */}
        <div>
          <Select value={selectedProvinceCode?.toString() || ''} onValueChange={handleProvinceChange}>
            <SelectTrigger className="h-12 bg-white border border-gray-300 text-sm">
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((prov) => (
                <SelectItem key={prov.code} value={prov.code.toString()}>
                  {prov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Select */}
        <div>
          <Select
            value={selectedDistrictCode?.toString() || ''}
            onValueChange={handleDistrictChange}
            disabled={!selectedProvinceCode || disabled}
          >
            <SelectTrigger className="h-12 bg-white border border-gray-300 text-sm">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((dist) => (
                <SelectItem key={dist.code} value={dist.code.toString()}>
                  {dist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward Select */}
        <div>
          <Select
            value={selectedWardCode?.toString() || ''}
            onValueChange={(wardCode) => {
              const wardName = wards.find(w => w.code === parseInt(wardCode, 10))?.name || '';
              handleWardChange(wardCode, wardName);
            }}
            disabled={!selectedDistrictCode || disabled}
          >
            <SelectTrigger className="h-12 bg-white border border-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <SelectValue placeholder="Ward" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={w.code.toString()}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};
