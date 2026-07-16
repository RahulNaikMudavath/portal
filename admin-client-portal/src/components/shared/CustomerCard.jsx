export default function CustomerCard({ task }) {
  if (
    !task ||
    (!task.customerName &&
     !task.phoneNumber &&
     !task.companyName)
  ) {
    return null;
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <span>👤</span> Customer
      </h2>

      <div className="grid grid-cols-2 gap-5">
        {task.customerName && (
          <div>
            <p className="text-slate-400 text-xs">Customer</p>
            <p className="text-white text-sm font-semibold mt-1">
              {task.customerName}
            </p>
          </div>
        )}

        {task.companyName && (
          <div>
            <p className="text-slate-400 text-xs">Company</p>
            <p className="text-white text-sm font-semibold mt-1">
              {task.companyName}
            </p>
          </div>
        )}

        {task.phoneNumber && (
          <div className="col-span-2">
            <p className="text-slate-400 text-xs">Phone</p>
            <p className="text-white text-sm font-semibold mt-1">
              {task.phoneNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
