import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

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

      <h2 className="font-semibold text-[18px]">Admin Control Center</h2>

      <div className="flex items-center gap-4">
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