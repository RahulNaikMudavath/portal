import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";

function Navbar({ setOpen }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-card text-text-primary shadow-xs p-4 border-b border-border sticky top-0 z-40 backdrop-blur-md bg-card/85">
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-xl cursor-pointer"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-[18px] hidden md:block">Admin Control Center</h2>
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          title="Open Spotlight Search (Ctrl+K)"
        >
          <span>🔍</span>
          <span className="font-medium">Search tasks, pages...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-750 font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold border border-slate-300 dark:border-slate-650">Ctrl K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <SoundToggle />
        <NotificationBell />
        <ThemeToggle />
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="bg-danger text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-danger/95 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;