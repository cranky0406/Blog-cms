import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaSearch, FaTrash, FaPlus, FaCheckCircle,
  FaFileAlt, FaLayerGroup, FaCalendarAlt, FaEye, FaPen
} from "react-icons/fa";

import API_BASE from "../../api";
import { authFetch } from "../../utils/csrfUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const safePosts = Array.isArray(posts) ? posts : [];
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/posts`, { credentials: "include" });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data.filter((p) => p.status === "published"));
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  const formatDateParts = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
    return {
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }),
    };
  };

  const uniqueCategories = [...new Set(safePosts.map((p) => (p.category || "General").toLowerCase()))];

  const todayCount = safePosts.filter((post) => {
    const d = new Date(post.created_at), t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }).length;

  const filteredPosts = useMemo(() => {
    let data = safePosts.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));
    switch (sortBy) {
      case "oldest": data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case "az":     data.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "za":     data.sort((a, b) => b.title.localeCompare(a.title)); break;
      default:       data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return data;
  }, [safePosts, search, sortBy]);

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const selectAll = () => {
    if (selected.length === filteredPosts.length && filteredPosts.length > 0) setSelected([]);
    else setSelected(filteredPosts.map((p) => p.id));
  };

  const bulkDelete = () => { if (!selected.length) return; setDeleteIds(selected); setShowDeleteModal(true); };
  const singleDelete = (id) => { setDeleteIds([id]); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    try {
      for (let id of deleteIds) {
        await authFetch(`${API_BASE}/api/posts/${id}`, { method: "DELETE" });
      }
      const res = await fetch(`${API_BASE}/api/posts`, { credentials: "include" });
      const data = await res.json();
      setPosts(data);
      setSelected([]);
      setDeleteIds([]);
      setShowDeleteModal(false);
      toast.success("Posts deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete posts");
    }
  };

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white">Manage Posts</h1>
          <p className="text-muted-foreground text-lg mt-2">Review, sort and manage all published content.</p>
        </div>
        <Button asChild size="lg">
          <Link to="/admin/create-post">
            <FaPlus className="mr-2" /> Create Post
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Posts"     value={safePosts.length}       icon={<FaFileAlt />}    color="blue" />
        <StatCard title="Published Today" value={todayCount}             icon={<FaCalendarAlt />} color="violet" />
        <StatCard title="Categories"      value={uniqueCategories.length} icon={<FaLayerGroup />} color="green" />
        <StatCard title="Selected"        value={selected.length}        icon={<FaCheckCircle />} color="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="pl-11 h-11 rounded-2xl"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11 w-44 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="az">Title A–Z</SelectItem>
              <SelectItem value="za">Title Z–A</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={bulkDelete}
            disabled={!selected.length}
            className="h-11 rounded-2xl"
          >
            Delete Selected
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-[60px] bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="w-[52px] text-center">
                  <input
                    type="checkbox"
                    checked={filteredPosts.length > 0 && selected.length === filteredPosts.length}
                    onChange={selectAll}
                    className="accent-blue-600 scale-110"
                  />
                </TableHead>
                <TableHead>Post</TableHead>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead className="w-[160px]">Published</TableHead>
                <TableHead className="w-[240px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPosts.map((post) => {
                const { date, time } = formatDateParts(post.created_at);
                return (
                  <TableRow key={post.id} className="group">
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        className="accent-blue-600 scale-110"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 overflow-hidden flex-shrink-0">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            post.title?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[280px]">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="uppercase text-[11px] tracking-wide">
                        {post.category || "General"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/blog/${post.slug}`}>
                            <FaEye className="mr-1.5" size={11} /> View
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link to={`/admin/edit-post/${post.slug}`}>
                            <FaPen className="mr-1.5" size={11} /> Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => singleDelete(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground text-lg">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader className="text-center items-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-3 text-xl">
              <FaTrash />
            </div>
            <DialogTitle className="text-2xl font-bold">Delete Post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. {deleteIds.length > 1 ? `${deleteIds.length} posts` : "This post"} will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const styles = {
    blue:   "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    green:  "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-5 min-h-[118px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-5xl font-black text-slate-900 dark:text-white mt-3">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${styles[color] ?? styles.blue}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
