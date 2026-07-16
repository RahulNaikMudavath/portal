import { useState } from "react";
import { submitTask } from "../../services/taskService";

export default function UploadModal({
  taskId,
  onClose,
  onSuccess
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!files.length) {
      return alert("Select at least one file");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      await submitTask(taskId, formData);

      alert("Work submitted successfully");

      onSuccess();

      onClose();

    } catch (error) {
      console.error(error);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md">

        <h2 className="text-white text-2xl font-bold mb-4">
          Upload Work
        </h2>

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="text-white mb-4"
        />

        <div className="flex gap-3">

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded-lg text-white"
          >
            {loading ? "Uploading..." : "Submit Work"}
          </button>

          <button
            onClick={onClose}
            className="bg-slate-700 px-4 py-2 rounded-lg text-white"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}