import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../api";
import { authFetch } from "../utils/csrfUtils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileMenu() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = () => {
    fetch(`${API_BASE}/api/users/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    window.addEventListener("profileUpdated", fetchUser);
    return () => window.removeEventListener("profileUpdated", fetchUser);
  }, []);

  const logout = async () => {
    await authFetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
    navigate("/login");
  };

  if (!user) return null;

  const initials = user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition outline-none">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-slate-900 dark:text-white font-semibold text-sm hidden sm:block">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
