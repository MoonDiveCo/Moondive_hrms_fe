import { useEffect } from "react";

export default function LaptopForm({ form, setForm }) {
  const handle = (k, v) => setForm({ ...form, [k]: v });

  useEffect(() => {
    if (form.storage && (!form.storageSize || !form.storageType)) {
      const parts = form.storage.split(" ");
      if (parts.length >= 3) {
        setForm({
          ...form,
          storageSize: `${parts[0]} ${parts[1]}`, 
          storageType: parts[2], 
        });
      }
    }
  }, [form.storage]);

  useEffect(() => {
    if (form.storageSize && form.storageType) {
      const merged = `${form.storageSize} ${form.storageType}`;
      if (form.storage !== merged) {
        setForm({ ...form, storage: merged });
      }
    }
  }, [form.storageSize, form.storageType]);

  return (
    <div>
      {/* BASIC INFO */}
      <h4 className="text-primaryText mb-3">Basic Information</h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Model Name */}
        <Input
          label="Model Name"
          value={form.modelName}
          onChange={(v) => handle("modelName", v)}
          placeholder="MacBook Pro 14-inch M2"
        />

        {/* Serial Number */}
        <Input
          label="Serial Number"
          value={form.serialNumber}
          onChange={(v) => handle("serialNumber", v)}
        />

        {/* Purchase Date */}
        <DateInput
          label="Purchase Date"
          value={form.purchaseDate}
          onChange={(v) => handle("purchaseDate", v)}
        />

        {/* Warranty */}
        <DateInput
          label="Warranty Expiry Date"
          value={form.expiryDate}
          onChange={(v) => handle("expiryDate", v)}
        />
      </div>

      {/* SPECS */}
      <h4 className="text-primaryText mt-6 mb-2">Specifications</h4>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Processor"
          value={form.processor}
          onChange={(v) => handle("processor", v)}
        />

        {/* RAM DROPDOWN */}
        <Select
          label="RAM"
          value={form.ram}
          options={["8 GB", "16 GB", "24 GB", "32 GB"]}
          onChange={(v) => handle("ram", v)}
        />

        {/* STORAGE SIZE */}
        <div className="flex gap-2">
        <Select
          label="Storage Size"
          value={form.storageSize}
          options={["256 GB", "512 GB", "1 TB"]}
          onChange={(v) => handle("storageSize", v)}
        />

        {/* STORAGE TYPE */}
        <Select
          label="Storage Type"
          value={form.storageType}
          options={["SSD", "HDD"]}
          onChange={(v) => handle("storageType", v)}
        /></div>

        <Input
          label="Graphics"
          value={form.graphics}
          onChange={(v) => handle("graphics", v)}
        />

        {/* SCREEN SIZE */}
        <Select
          label="Screen Size"
          value={form.screenSize}
          options={["13.6 INCH","14 INCH", "15 INCH", "15.6 INCH"]}
          onChange={(v) => handle("screenSize", v)}
        />

        {/* OS */}
        <Select
          label="Operating System"
          value={form.operatingSystem}
          options={["Windows", "Mac OS"]}
          onChange={(v) => handle("operatingSystem", v)}
        />
      </div>

      {/* STATUS + CONDITION */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Select
          label="Status"
          value={form.status}
          options={["Working", "Not Working", "In Repair"]}
          onChange={(v) => handle("status", v)}
        />

        <Select
          label="Condition"
          value={form.condition}
          options={["New", "Good", "Used", "Damaged"]}
          onChange={(v) => handle("condition", v)}
        />
      </div>

      {/* NOTES */}
      <textarea
        className="w-full border p-2 rounded mt-4"
        placeholder="Any additional notes..."
        value={form.notes || ""}
        onChange={(e) => handle("notes", e.target.value)}
      />
    </div>
  );
}


const Input = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-sm">{label} <span className="text-red-500">*</span></label>
    <input
      className="w-full border p-2 rounded mt-1"
      value={value || ""}
      placeholder={placeholder || label}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-sm">{label} <span className="text-red-500">*</span></label>
    <select
      className="w-full border p-2 rounded mt-1"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const DateInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm">{label}</label>
    <input
      type="date"
      className="w-full border p-2 rounded mt-1"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
