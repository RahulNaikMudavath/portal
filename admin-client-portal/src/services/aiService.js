/**
 * Clean Service Layer for AI Assistant.
 * To integrate with Google Gemini / OpenAI in the future,
 * modify only the implementation inside the askAi function.
 */

export const askAi = async (promptType, context = {}) => {
  // Simulate network delay for realistic AI thinking experience
  await new Promise((resolve) => setTimeout(resolve, 800));

  const {
    customerName = "N/A",
    projectName = "Unassigned Project",
    timeline = "N/A",
    tasks = [],
    notes = [],
    photos = [],
    materials = [],
    progress = 0,
    budget = 0,
    visitStatus = "N/A",
    priority = "medium",
  } = context;

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasksCount = tasks.filter((t) => t.status === "in-progress" || t.status === "working").length;

  switch (promptType) {
    case "summary":
      return {
        title: "📋 Project Summary",
        content: `Project "${projectName}" is currently active under client ${customerName}. Overall progress is logged at ${progress}%, with ${completedTasksCount}/${totalTasksCount} tasks completed and ${inProgressTasksCount} tasks actively in progress. The team has recorded ${materials.length} material logs and ${notes.length} internal checklist notes.`,
      };

    case "risks":
      const budgetRisk = budget > 0 && tasks.reduce((sum, t) => sum + (Number(t.estimatedBudget) || 0), 0) > budget
        ? "⚠️ Committed task allocations exceed the total project budget limit."
        : "✅ Task allocations are within the project's financial budget thresholds.";
      const delayRisk = progress < 50 && timeline && new Date(timeline) < new Date()
        ? "⚠️ Target deadline is approaching with less than 50% task progression completed."
        : "✅ Timeline delivery parameters appear stable.";

      return {
        title: "⚠️ Risk Detection Report",
        content: `1. **Budget Risk**: ${budgetRisk}\n2. **Timeline Risk**: ${delayRisk}\n3. **Safety Risk**: Ensure on-site supervisors verify safety harnesses and inspect scaffolding before working at elevated sections.\n4. **Unassigned Tasks**: ${
          tasks.some((t) => !t.assignedTo)
            ? "⚠️ Several tasks lack assigned engineers. Assign resources immediately."
            : "✅ All active tasks have been allocated to engineering staff."
        }`,
      };

    case "budget":
      const allocated = tasks.reduce((sum, t) => sum + (Number(t.estimatedBudget) || 0), 0);
      const remaining = budget - allocated;
      return {
        title: "💰 Budget Insights & Audits",
        content: `* **Total Project Budget**: ₹${budget.toLocaleString("en-IN")}\n* **Committed Tasks Cost**: ₹${allocated.toLocaleString("en-IN")}\n* **Surplus Reserves**: ₹${remaining.toLocaleString("en-IN")}\n* **Financial Health**: ${
          remaining < 0 ? "Critical Deficit - Budget Overrun!" : "Healthy Surplus - Reserve reserves stable."
        }\n* **Insight**: Allocate contingency resources to cover unexpected material cost deviations.`,
      };

    case "materials":
      return {
        title: "🧱 Material Suggestions",
        content: `Based on active tasks and notes, here are the recommendations:\n1. **Cement/Steel**: Maintain safety stock of high-grade reinforcement steel bars (TMT) to avoid foundation bottlenecks.\n2. **Concrete Mix**: Arrange next cement delivery batches 48 hours before task checkpoint execution.\n3. **Active Allocation**: Current allocation records show ${
          materials.length
        } item(s) logged (${materials.map((m) => `${m.qty} ${m.unit} of ${m.name}`).join(", ") || "No logs yet"}).`,
      };

    case "missing":
      const missingSign = !context.customerSignature ? "⚠️ Customer sign-off verification is currently missing." : "✅ Customer sign-off signature is verified.";
      const missingPhotos = photos.length === 0 ? "⚠️ No site photos uploaded to the gallery checklist." : `✅ Gallery contains ${photos.length} site records.`;
      return {
        title: "🔍 Missing Project Information",
        content: `* **Signature**: ${missingSign}\n* **Photos**: ${missingPhotos}\n* **Coordinates**: ${
          context.location ? "✅ Location parameters verified." : "⚠️ Latitude/longitude coordinates missing for maps."
        }\n* **Timeline Dates**: ${timeline ? "✅ Deadline configured." : "⚠️ No target completion date defined."}`,
      };

    case "next":
      return {
        title: "⚡ Next Recommended Action",
        content: `1. **Resource Allocation**: Assign an inspector to audit travel check-ins (${visitStatus}).\n2. **Checklist Review**: Finalize notes verification and approve ${
          tasks.filter((t) => t.status === "completed" && t.reviewStatus !== "approved").length
        } task(s) awaiting approval.\n3. **Client Align**: Schedule a WhatsApp touchpoint to coordinate G+2 structural estimations.`,
      };

    case "engineers":
      return {
        title: "👷 Engineer Recommendations",
        content: `* **Structural Engineering**: Route complex layout blueprints to senior valuer M. Ramesh Naik (B.Tech, M.Tech).\n* **Field Operations**: Assign certified civil supervisors to oversee concrete strength curing checklists.\n* **Capacity Allocation**: Ensure engineer allocations do not exceed 3 active tasks simultaneously to prevent fatigue.`,
      };

    case "safety":
      return {
        title: "🛡️ Procore-grade Safety Tips",
        content: `1. **PPE Compliance**: Hard hats, high-visibility vests, and safety boots are mandatory at all site coordinates.\n2. **Weather Audits**: Monitor wind speeds and precipitation index before operating crane rigs.\n3. **Scaffolding**: Inspect load tags on scaffolding frameworks daily before commencement of work.`,
      };

    default:
      return {
        title: "🤖 ConstructAI Analysis",
        content: `I've analyzed your project parameters. What other custom insights can I run for you today?`,
      };
  }
};
