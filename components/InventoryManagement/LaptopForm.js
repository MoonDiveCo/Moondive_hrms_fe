export default function LaptopForm({ form, setForm }) {
  const handle = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div >
      {/* BASIC INFO */}
      <h4 className="text-primaryText mb-3">Basic Information</h4>

      <div className="grid grid-cols-2 gap-4">

        {/* Model Name */}
        <div>
          <label className="text-sm">Model Name <span className="text-red-500">*</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="MacBook Pro 14-inch M2"
            value={form.modelName || ""}
            onChange={(e) => handle("modelName", e.target.value)}
          />
        </div>

        {/* Serial Number */}
        <div>
          <label className="text-sm">Serial Number <span className="text-red-500">*</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="C02XL1234567"
            value={form.serialNumber || ""}
            onChange={(e) => handle("serialNumber", e.target.value)}
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="text-sm">Purchase Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            value={form.purchaseDate || ""}
            onChange={(e) => handle("purchaseDate", e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm">Warranty expiryDate <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            value={form.expiryDate || ""}
            onChange={(e) => handle("expiryDate", e.target.value)}
          />
        </div>

      </div>

      {/* SPECS SECTION */}
      <h4 className="text-primaryText mt-6 mb-2">Specifications</h4>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Processor" keyName="processor" form={form} setForm={setForm} />
        <InputField label="RAM *" keyName="ram" form={form} setForm={setForm} />
        <InputField label="Storage" keyName="storage" form={form} setForm={setForm} />
        <InputField label="Graphics" keyName="graphics" form={form} setForm={setForm} />
        <InputField label="Screen Size" keyName="screenSize" form={form} setForm={setForm} />
        <InputField label="Operating System" keyName="operatingSystem" form={form} setForm={setForm} />
      </div>

      {/* STATUS + CONDITION */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <SelectField
          label="Status"
          keyName="status"
          options={["Working", "Not Working", "In Repair"]}
          form={form}
          setForm={setForm}
        />

        <SelectField
          label="Condition"
          keyName="condition"
          options={["New", "Good", "Used", "Damaged"]}
          form={form}
          setForm={setForm}
        />
      </div>

      {/* NOTES */}
      <textarea
        className="w-full border border-gray-300 p-2 rounded mt-4"
        placeholder="Any additional notes..."
        value={form.notes || ""}
        onChange={(e) => handle("notes", e.target.value)}
      />
    </div>
  );
}

const InputField = ({ label, keyName, form, setForm }) => (
  <div>
    <label className="text-sm">{label}</label>
    <input
      className="w-full border border-gray-300 p-2 rounded mt-1"
      value={form[keyName] || ""}
      onChange={(e) => setForm({ ...form, [keyName]: e.target.value })}
      placeholder={label}
    />
  </div>
);

const SelectField = ({ label, keyName, options, form, setForm }) => (
  <div>
    <label className="text-sm">{label}</label>
    <select
      className="w-full border border-gray-300 p-2 rounded mt-1"
      value={form[keyName] || ""}
      onChange={(e) => setForm({ ...form, [keyName]: e.target.value })}
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
