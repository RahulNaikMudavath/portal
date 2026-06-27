import { useState } from "react";
import { convertWorkRequest } from "../../services/workRequestService";

function AssignWorkModal({
  open,
  onClose,
  request,
}) {
  const [engineer, setEngineer] = useState("");
  const [priority, setPriority] = useState(
    request?.priority || "medium"
  );
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const handleConvert = async () => {

try{

await convertWorkRequest(request._id,{

assignedEngineer: engineer,

priority,

deadline,

budget,

notes

});

alert("Work Order Created!");

onClose();

}
catch(err){

console.log(err);

alert("Conversion Failed");

}

}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">

      <div className="h-full w-[500px] bg-slate-900 border-l border-slate-700 p-8 overflow-y-auto">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">
            Assign Work Order
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>

        </div>

        <div className="mt-8 space-y-6">

          <div>
            <label className="text-slate-300">
              Engineer
            </label>

            <select
              value={engineer}
              onChange={(e) =>
                setEngineer(e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option value="">Select Engineer</option>
              <option>Rahul</option>
              <option>Ramesh</option>
              <option>Suresh</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>low</option>
              <option>medium</option>
              <option>high</option>
              <option>urgent</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300">
              Deadline
            </label>

            <input
              type="date"
              value={deadline}
              onChange={(e) =>
                setDeadline(e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300">
              Estimated Budget
            </label>

            <input
              type="number"
              placeholder="25000"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300">
              Internal Notes
            </label>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
            />
          </div>

          <button
          onClick={handleConvert} className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700">🚀 Convert To Work Order
          </button>

        </div>

      </div>

    </div>
  );
}

export default AssignWorkModal;