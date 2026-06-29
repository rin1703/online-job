type Option = {
  code: string | number;
  name: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string | number | '';
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
