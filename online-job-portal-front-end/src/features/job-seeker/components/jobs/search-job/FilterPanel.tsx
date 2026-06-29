'use client';

import type React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    industry: string[];
    location: string[];
    experience: string[];
    level: string[];
    salary: { min: number; max: number };
    workType: string[];
  };
  onFilterChange: (filters: any) => void;
  industries: string[];
  locations: string[];
}

const experiences = ['No experience required', '1 year', '2 years', '3 years', '5+ years'];
const levels = ['Staff', 'Manager', 'Director'];
const workTypes = ['onsite', 'remote', 'hybrid'];

export default function FilterPanel({
  filters,
  onFilterChange,
  industries,
  locations,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    industry: true,
    location: true,
    experience: true,
    level: false,
    salary: false,
    workType: false,
  });

  type SectionName = keyof typeof expandedSections;

  const toggleSection = (section: SectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMultiSelect = (key: keyof FilterPanelProps['filters'], value: string) => {
    const currentArray = Array.isArray(filters[key]) ? (filters[key] as string[]) : [];

    const updated = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFilterChange({
      ...filters,
      [key]: updated,
    });
  };

  const handleSalaryChange = (type: 'min' | 'max', value: number) => {
    onFilterChange({
      ...filters,
      salary: {
        ...filters.salary,
        [type]: value,
      },
    });
  };

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: SectionName;
    children: React.ReactNode;
  }) => (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between mb-3 font-bold text-foreground hover:text-primary transition"
      >
        <span className="text-sm">{title}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
        />
      </button>
      {expandedSections[section] && <div className="space-y-2">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <FilterSection title="NGÀNH NGHỀ" section="industry">
        {industries
          .filter((ind) => ind !== 'all')
          .map((industry) => (
            <label
              key={industry}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                type="checkbox"
                name="industry"
                checked={(filters.industry || []).includes(industry)}
                onChange={() => handleMultiSelect('industry', industry)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{industry}</span>
            </label>
          ))}
      </FilterSection>

      <FilterSection title="ĐỊA ĐIỂM" section="location">
        {locations
          .filter((loc) => loc !== 'all')
          .map((location) => (
            <label
              key={location}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                type="checkbox"
                name="location"
                checked={(filters.location || []).includes(location)}
                onChange={() => handleMultiSelect('location', location)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{location}</span>
            </label>
          ))}
      </FilterSection>

      <FilterSection title="KINH NGHIỆM" section="experience">
        {experiences.map((exp) => (
          <label
            key={exp}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <input
              type="checkbox"
              name="experience"
              checked={(filters.experience || []).includes(exp)}
              onChange={() => handleMultiSelect('experience', exp)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-foreground">{exp}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="CẤP BẬC" section="level">
        {levels.map((level) => (
          <label
            key={level}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <input
              type="checkbox"
              name="level"
              checked={(filters.level || []).includes(level)}
              onChange={() => handleMultiSelect('level', level)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-foreground capitalize">{level}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="MỨC LƯƠNG" section="salary">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Từ:</label>
            <input
              type="number"
              value={filters.salary.min}
              onChange={(e) => handleSalaryChange('min', Number.parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Đến:</label>
            <input
              type="number"
              value={filters.salary.max}
              onChange={(e) =>
                handleSalaryChange('max', Number.parseInt(e.target.value) || 100000000)
              }
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="100000000"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="HÌNH THỨC LÀMING VIỆC" section="workType">
        {workTypes.map((type) => (
          <label
            key={type}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <input
              type="checkbox"
              name="workType"
              checked={(filters.workType || []).includes(type)}
              onChange={() => handleMultiSelect('workType', type)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-foreground capitalize">
              {type === 'onsite' ? 'Onsite' : type === 'remote' ? 'Remote' : 'Hybrid'}
            </span>
          </label>
        ))}
      </FilterSection>
    </div>
  );
}
