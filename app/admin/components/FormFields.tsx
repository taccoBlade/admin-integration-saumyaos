import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  value,
  placeholder,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="block w-full rounded-lg border border-purple-500/20 bg-white/[0.035] px-3 py-2.5 font-mono text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-slate-600 focus:border-violet-300/40 focus:bg-white/[0.055] focus:ring-2 focus:ring-violet-300/10"
      />
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function FormTextarea({
  label,
  name,
  required = false,
  defaultValue,
  value,
  placeholder,
  rows = 3,
  onChange,
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        className="block w-full rounded-lg border border-purple-500/20 bg-white/[0.035] px-3 py-2.5 font-mono text-xs leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-slate-600 focus:border-violet-300/40 focus:bg-white/[0.055] focus:ring-2 focus:ring-violet-300/10"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function FormSelect({
  label,
  name,
  required = false,
  defaultValue,
  value,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className="block w-full rounded-lg border border-purple-500/20 bg-white/[0.035] px-3 py-2.5 font-mono text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-violet-300/40 focus:bg-white/[0.055] focus:ring-2 focus:ring-violet-300/10"
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
