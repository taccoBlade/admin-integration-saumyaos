import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5 font-mono">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50 font-mono"
      />
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function FormTextarea({
  label,
  name,
  required = false,
  defaultValue,
  placeholder,
  rows = 3,
  onChange,
}: FormTextareaProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5 font-mono">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50 font-mono"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function FormSelect({
  label,
  name,
  required = false,
  defaultValue,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5 font-mono">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange}
        className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50 font-mono"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
