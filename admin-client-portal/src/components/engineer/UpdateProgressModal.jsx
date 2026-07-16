import { useState } from "react";

function UpdateProgressModal({
  open,
  onClose,
  onSubmit,
}) {
  const [percentage, setPercentage] = useState(25);
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-slate-900 w-[450px] rounded-2xl p-6">

        <h2 className="text-2xl font-bold text-white">
          Update Progress
        </h2>

        <div className="grid grid-cols-4 gap-3 mt-6">

          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentage(p)}
              className={`rounded-xl py-3
              ${
                percentage === p
                  ? "bg-blue-600"
                  : "bg-slate-700"
              }`}
            >
              {p}%
            </button>
          ))}

        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what you've completed..."
          className="
          mt-6
          w-full
          rounded-xl
          bg-slate-800
          p-4
          text-white
          "
          rows={5}
        />

        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="
            flex-1
            bg-slate-700
            py-3
            rounded-xl
            "
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSubmit({
                percentage,
                message,
              })
            }
            className="
            flex-1
            bg-blue-600
            py-3
            rounded-xl
            text-white
            "
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default UpdateProgressModal;