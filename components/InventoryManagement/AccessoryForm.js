export default function AccessoryForm({ form, setForm }) {
  const handle = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div>
      <h4 className="text-primaryText mb-3">Basic Information</h4>

      <div className="grid grid-cols-2 gap-4">

        {/* Type */}
        <div>
          <label className="text-sm">Type <span className="text-red-500">*</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="e.g., Headphone, Dock, Adapter"
            value={form.type || ""}
            onChange={(e) => handle("type", e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm">Quantity <span className="text-red-500">*</span></label>
         <input
            type="number"
            min={0}
            step={1}
            className="w-full border border-gray-300 p-2 rounded mt-1"
            value={form.quantity ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0) return;
              handle("quantity", value);
            }}
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-sm">Brand <span className="text-red-500">*</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="Apple, Logitech, Sony"
            value={form.brand || ""}
            onChange={(e) => handle("brand", e.target.value)}
          />
        </div>

        {/* Condition */}
        <div>
          <label className="text-sm">Condition<span className="text-red-500">*</span></label>
          <select
            className="w-full border border-gray-300 p-2 rounded mt-1"
            value={form.condition || ""}
            onChange={(e) => handle("condition", e.target.value)}
          >
            <option value="">Select Condition</option>
            {["New", "Good", "Used", "Damaged"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="text-sm">Model <span className="text-red-500">*</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="AirPods Pro, MX Master 3"
            value={form.model || ""}
            onChange={(e) => handle("model", e.target.value)}
          />
        </div>

        {/* Low Stock */}
        {/* <div>
          <label className="text-sm">Low Stock Alert <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            value={form.lowStock || ""}
            onChange={(e) => handle("lowStock", e.target.value)}
          />
        </div> */}

        {/* Compatible With */}
        <div className="col-span-2">
          <label className="text-sm">Compatible With</label>
          <input
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="MacBook Pro, Dell XPS"
            value={form.compatibility || ""}
            onChange={(e) => handle("compatibility", e.target.value)}
          />
        </div>

        {/* Serial Numbers list */}
        <div className="col-span-2">
          <label className="text-sm">Serial Numbers</label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="Add each serial number on a new line"
            rows={3}
            value={form.serials || ""}
            onChange={(e) => handle("serials", e.target.value)}
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

        {/* Upload Invoice */}
        {/* <div>
          <label className="text-sm">Invoice Document</label>
          <input
            type="file"
            className="mt-1"
            onChange={(e) => handle("invoice", e.target.files[0])}
          />
        </div> */}

        {/* Specifications */}
        {/* <div className="col-span-2">
          <h4 className="text-primaryText mt-4 mb-2">Specifications</h4>
        </div>

        {specField("Color", "color", form, setForm)}
        {specField("Dimensions", "dimensions", form, setForm)}
        {specField("Weight", "weight", form, setForm)}
        {specField("Connectivity", "connectivity", form, setForm)}
        {specField("Features", "features", form, setForm)} */}

        {/* Notes */}
        <div className="col-span-2 mt-4">
          <label className="text-sm">Notes</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 p-2 rounded mt-1"
            placeholder="Any additional notes..."
            value={form.notes || ""}
            onChange={(e) => handle("notes", e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}

const specField = (label, key, form, setForm) => (
  <div>
    <label className="text-sm">{label}</label>
    <input
      className="w-full border border-gray-300 p-2 rounded mt-1"
      value={form[key] || ""}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
    />
  </div>
);
