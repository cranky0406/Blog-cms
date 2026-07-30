import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaFileAlt, FaGlobe, FaChartLine } from "react-icons/fa";

import API_BASE from "../../api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/posts`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setPosts([]);
      })
      .catch((err) => console.error(err));
  }, []);

  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts     = posts.filter((p) => p.status === "draft");

  const categories = [...new Set(
    publishedPosts.map((post) => (post.category?.trim() || "General").toLowerCase())
  )];

  const recentPosts = [...publishedPosts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const currentDate  = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear  = currentDate.getFullYear();

  const thisMonthPosts = publishedPosts.filter((post) => {
    const d = new Date(post.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const drafts = draftPosts.length;

  const [postCount,     setPostCount]     = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [monthCount,    setMonthCount]    = useState(0);
  const [draftCount,    setDraftCount]    = useState(0);

  useEffect(() => {
    animateCounter(publishedPosts.length, setPostCount);
    animateCounter(categories.length,    setCategoryCount);
    animateCounter(thisMonthPosts,       setMonthCount);
    animateCounter(drafts,               setDraftCount);
  }, [posts]);

  const animateCounter = (target, setter) => {
    setter(0);
    if (target === 0) return;
    let current = 0;
    const step  = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setter(target); clearInterval(timer); }
      else setter(current);
    }, 25);
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
    });
  };

  const chartHeight = (value) => {
    if (value === 0) return "4px";
    const max = Math.max(publishedPosts.length, categories.length, thisMonthPosts, drafts, 1);
    return `${(value / max) * 100}%`;
  };

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your content and monitor publishing activity
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Link to="/admin/create-post">
            <FaPlus className="mr-2" /> Create Post
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Published"  value={postCount}     sub="Live posts"           color="from-blue-600 to-indigo-600"   border="from-blue-500 to-indigo-500" />
        <StatCard title="Categories" value={categoryCount} sub="Used categories"       color="from-green-500 to-emerald-600" border="from-green-500 to-emerald-600" />
        <StatCard title="This Month" value={monthCount}    sub="Published this month"  color="from-purple-500 to-pink-500"   border="from-purple-500 to-pink-500" />
        <StatCard title="Drafts"     value={draftCount}    sub="Saved drafts"          color="from-orange-400 to-amber-500"  border="from-orange-400 to-amber-500" />
      </div>

      {/* Recent Posts + Analytics */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Recent Posts */}
        <Card className="xl:col-span-2 rounded-3xl border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">Recent Posts</CardTitle>
              <CardDescription className="mt-1">Your latest posts</CardDescription>
            </div>
            <Link to="/admin/posts" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm">
              View All
            </Link>
          </CardHeader>

          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No posts available.
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center uppercase flex-shrink-0">
                        {post.title?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{post.title}</h3>
                          <Badge
                            variant={post.status === "published" ? "default" : "secondary"}
                            className="text-[10px] uppercase tracking-wide"
                          >
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(post.created_at)}</p>
                      </div>
                    </div>

                    {post.status === "published" ? (
                      <Link to={`/blog/${post.slug}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm">
                        View
                      </Link>
                    ) : (
                      <Link to={`/admin/edit-post/${post.slug}`} className="text-muted-foreground font-medium hover:underline text-sm">
                        Edit
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Analytics */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <FaChartLine className="text-blue-600 dark:text-blue-400" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-end justify-between gap-4">
                <Bar label="Published"  value={publishedPosts.length} height={chartHeight(publishedPosts.length)} color="from-blue-500 to-indigo-500" />
                <Bar label="Categories" value={categories.length}     height={chartHeight(categories.length)}     color="from-green-500 to-emerald-500" />
                <Bar label="Month"      value={thisMonthPosts}        height={chartHeight(thisMonthPosts)}         color="from-purple-500 to-pink-500" />
                <Bar label="Drafts"     value={drafts}                height={chartHeight(drafts)}                color="from-orange-400 to-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-center gap-2">
                <Link to="/admin/create-post">
                  <FaPlus /> Create New Post
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-center gap-2">
                <Link to="/admin/posts">
                  <FaFileAlt /> Manage Posts
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center gap-2">
                <Link to="/">
                  <FaGlobe /> View Website
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, sub, color, border }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 lg:p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${border}`} />
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      <h2 className={`text-6xl font-black mt-5 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</h2>
      <p className="text-sm text-muted-foreground mt-2">{sub}</p>
    </div>
  );
}

function Bar({ label, value, height, color }) {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</span>
      <div className="w-full h-40 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden flex items-end">
        <div
          className={`w-full bg-gradient-to-t ${color} rounded-2xl shadow-sm transition-all duration-1000 ease-out`}
          style={{ height }}
        />
      </div>
      <p className="text-xs font-semibold text-muted-foreground text-center">{label}</p>
    </div>
  );
}
