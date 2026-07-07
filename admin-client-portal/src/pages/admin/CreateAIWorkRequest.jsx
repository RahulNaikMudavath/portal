import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { useWorkRequest } from "../../context/WorkRequestContext";
import axios from "axios";
import { createWorkRequest } from "../../services/workRequestService";

const CreateAIWorkRequest = () => {

    const navigate = useNavigate();

    const { draftRequest } = useWorkRequest();

    const [form, setForm] = useState({

        customerName: "",

        phoneNumber: "",

        projectType: "",

        subject: "",

        description: "",

        estimatedBudget: "",

        priority: "medium",

        assignedEngineer: "",

        preferredVisitDate: ""

    });

    useEffect(() => {

        if (!draftRequest) return;

        setForm({

            customerName:
                draftRequest.customerName || "",

            phoneNumber:
                draftRequest.phoneNumber || "",

            projectType:
                draftRequest.projectType || "",

            subject:
                draftRequest.subject || "",

            description:
                draftRequest.description || "",

            estimatedBudget:
                draftRequest.estimatedBudget || "",

            priority:
                draftRequest.priority?.toLowerCase() || "medium",

            assignedEngineer: "",

            preferredVisitDate: ""

        });

    }, [draftRequest]);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleCreateRequest = async () => {
  try {
    const payload = {
      customerName: form.customerName,
      companyName: "",
      phoneNumber: form.phoneNumber,
      whatsappNumber: form.phoneNumber,
      email: "",
      source: "whatsapp",

      projectType: form.projectType,

      siteAddress: "",
      googleLocation: "",

      subject: form.subject,

      description: form.description,

      estimatedBudget: Number(
        String(form.estimatedBudget).replace(/\D/g, "")
      ) || 0,

      preferredVisitDate:
        form.preferredVisitDate || null,

      priority: form.priority,

      attachments: [],

      conversationHistory: [],

      aiSummary: {
        summary: form.description,
        extractedFields: {
          budget: form.estimatedBudget,
          projectType: form.projectType,
        },
      },
    };

    console.log("Sending Payload");

    console.log(payload);

    const res = await createWorkRequest(payload);

    console.log("Created");

    console.log(res.data);

    alert("✅ Work Request Created");

    navigate("/admin/work-inbox");

  } catch (err) {

    console.error(err);

    alert("Failed to create work request");

  }
};

    return (

        <AdminLayout>

            <div className="max-w-5xl mx-auto bg-slate-900 rounded-xl p-8">

                <h1 className="text-3xl font-bold text-white mb-8">

                    🤖 AI Work Request

                </h1>

                <form className="space-y-6">

    <div className="grid grid-cols-2 gap-5">

        <div>
            <label className="text-slate-300">
                Customer Name
            </label>

            <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            />
        </div>

        <div>
            <label className="text-slate-300">
                Phone Number
            </label>

            <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            />
        </div>

        <div>
            <label className="text-slate-300">
                Project Type
            </label>

            <input
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            />
        </div>

        <div>
            <label className="text-slate-300">
                Budget
            </label>

            <input
                name="estimatedBudget"
                value={form.estimatedBudget}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            />
        </div>

    </div>

    <div>

        <label className="text-slate-300">
            Subject
        </label>

        <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
        />

    </div>

    <div>

        <label className="text-slate-300">
            Description
        </label>

        <textarea
            rows={6}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
        />

    </div>

    <button
type="button"
onClick={handleCreateRequest}
        className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 text-white font-bold"
    >
        🚀 Create Work Request
    </button>

</form>

            </div>

        </AdminLayout>

    );

};

export default CreateAIWorkRequest;