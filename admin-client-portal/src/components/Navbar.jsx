import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

function Navbar({ setOpen }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text shadow p-4 border-b border-light-border dark:border-dark-border">
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-xl"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <h2 className="font-semibold text-lg">Admin Panel</h2>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <ThemeToggle />
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;