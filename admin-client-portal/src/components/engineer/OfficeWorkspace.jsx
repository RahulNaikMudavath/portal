import NotesCard from "./NotesCard";
import AIAnalysisCard from "./AIAnalysisCard";
import CustomerCard from "./CustomerCard";
import ProgressCard from "./ProgressCard";
import AttachmentsCard from "./AttachmentsCard";
import TimelineCard from "./TimelineCard";
import TaskActionBar from "./TaskActionBar";
import TaskHeader from "./TaskHeader";
import TaskComments from "../comments/TaskComments";

export default function OfficeWorkspace({
  task,
  onStartTask,
  onProgressUpdate,
  onSubmitWork,
  onRefresh,
}) {
  return (
    <div className="space-y-6">
      {/* Task Header */}
      <TaskHeader task={task} />

      {/* Dynamic Action Bar */}
      <TaskActionBar
        task={task}
        onStartTask={onStartTask}
        onProgressUpdate={onProgressUpdate}
        onSubmitWork={onSubmitWork}
        onRefresh={onRefresh}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main instructions, guidelines, attachments & comments) */}
        <div className="lg:col-span-7 space-y-6">
          <NotesCard task={task} onRefresh={onRefresh} />
          <AttachmentsCard task={task} />
          <TaskComments taskId={task._id} />
        </div>

        {/* Right Column (Customer, timeline, analytics & progress) */}
        <div className="lg:col-span-5 space-y-6">
          <ProgressCard
            task={task}
            onUpdate={onProgressUpdate}
          />
          <CustomerCard task={task} />
          <TimelineCard task={task} />
          <AIAnalysisCard task={task} />
        </div>
      </div>
    </div>
  );
}
