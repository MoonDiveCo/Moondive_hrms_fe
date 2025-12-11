export default function InventoryCard({ item, onClick }) {
  const isNotWorking = item?.specs?.status === "Not Working";
  const statusReason = item?.assignedTo?.issues[0]?.description || null;
  const status = item?.assignedTo?.issues[0]?.status || null;

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg shadow-sm p-2 cursor-pointer group min-w-[250px] transition-all hover:-translate-y-1 
        ${isNotWorking 
          ? "bg-red-50 border-red-300 hover:shadow-red-400" 
          : "bg-white border-gray-200 hover:shadow-lg"
        }`}
    >

      {/* IMAGE */}
      <div className={`h-36 w-full rounded-lg mb-4 overflow-hidden flex items-center justify-center 
        ${isNotWorking ? "bg-red-100" : "bg-gray-50"}
      `}>
        {item.productImage ? (
          <img
            src={item.productImage}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-400 text-sm flex flex-col items-center">
            <span className="text-2xl">📦</span>
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* CATEGORY BADGE */}
      <span
        className={`inline-block text-[11px] px-2 py-1 rounded-full mb-2 font-semibold tracking-wide
        ${isNotWorking ? "bg-red-200 text-red-800" : "bg-indigo-50 text-indigo-700"}`}
      >
        {item.category}
      </span>

      {/* ITEM TITLE */}
      <h5 className="font-semibold text-lg text-primaryText leading-tight">
        {item.specs?.modelName ||
          `${item.specs?.brand} ${item.specs?.type}` ||
          "Unnamed Item"}
      </h5>

      {/* ⚠ STATUS BADGE */}
      {isNotWorking && (
        <div className="mt-2">
          <span className="inline-block text-xs px-2 py-1 rounded bg-red-600 text-white font-semibold line-clamp-1">
            Not Working {status==="Open" ? `(${statusReason})` : ""}
          </span>
        </div>
      )}

      {/* SERIAL NUMBER */}
      {item.specs?.serialNumber && (
        <p className="text-sm text-gray-500 mt-1">
          Serial No:{" "}
          <span className="font-medium text-gray-700">{item.specs.serialNumber}</span>
        </p>
      )}

      {/* QUANTITY */}
      {item.specs?.quantity && (
        <p className="text-sm text-gray-500 mt-1">
          Quantity:{" "}
          <span className="font-medium text-gray-700">{item.specs.quantity}</span>
        </p>
      )}

      {/* Divider */}
      <div className="my-3 border-t border-gray-100"></div>

      {/* ASSIGNMENT STATUS */}
      {item.category === "Laptop" ? (
        item.assignedTo?.id ? (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Assigned to {item.assignedTo.name}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Not Assigned
          </div>
        )
      ) : (
        <div>
          {item.usersHistory?.filter((u) => !u.returnedDate).length !== 0 ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {item.usersHistory.filter((u) => !u.returnedDate).length} Assigned
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              0 Assigned
            </div>
          )}
        </div>
      )}
    </div>
  );
}
