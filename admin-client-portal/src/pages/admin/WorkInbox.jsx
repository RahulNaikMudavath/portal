import AdminLayout from "../../layouts/AdminLayout";
import { useState } from "react";
import WorkRequestCard from "../../components/workrequest/WorkRequestCard";
import WorkRequestPreview from "../../components/workrequest/WorkRequestPreview";
import { useEffect } from "react";
import { getWorkRequests } from "../../services/workRequestService";




function WorkInbox() {
const [requests, setRequests] = useState([]);
const [selected, setSelected] = useState(null);
const [loading, setLoading] = useState(true);

const loadRequests = async () => {
  try {
    const data = await getWorkRequests();

    setRequests(data);

    if (data.length > 0) {
      setSelected(data[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadRequests();
}, []);

if (loading) {
  return (
    <AdminLayout>
      <h1 className="text-3xl text-white">
        Loading Work Requests...
      </h1>
    </AdminLayout>
  );
}

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          📥 Work Inbox
        </h1>

        <p className="mt-2 text-slate-400">
          All incoming customer work requests appear here before assignment.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Left Side */}

        <div className="space-y-4">

          {requests.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-10 text-center">
              <h2 className="text-xl text-white">
                No Work Requests Yet
              </h2>

              <p className="mt-3 text-slate-400">
                WhatsApp requests will appear here automatically.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <WorkRequestCard
                key={request._id}
                request={request}
                selected={selected?._id === request._id}
                onClick={setSelected}
              />
            ))
          )}

        </div>

        {/* Right Side */}

        <div className="col-span-2">

          <WorkRequestPreview
            request={selected}
          />

        </div>

      </div>
    </AdminLayout>
  );
}

export default WorkInbox;