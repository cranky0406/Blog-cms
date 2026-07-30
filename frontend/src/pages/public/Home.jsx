import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/posts/public`)
      .then((res) => res.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  // ── All original logic unchanged ────────────────────────────────
  const formatCategory = (cat) => {
    if (!cat) return "General";
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(sortedPosts.map((p) => formatCategory(p.category))),
  ];

  const filteredPosts = sortedPosts.filter((post) => {
    const matchSearch   = (post.title || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || formatCategory(post.category) === activeCategory;
    return matchSearch && matchCategory;
  });

  const featured = filteredPosts[0];
  const rest      = filteredPosts.slice(1);

  const getRelativeTime = (value) => {
    const createdAt = new Date(value);
    const now       = new Date();
    const diffMs    = now - createdAt;
    if (Number.isNaN(createdAt.getTime()) || diffMs < 0) return "just now";
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1)  return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)   return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  };

  const categoryColors = {
    Tech:     "bg-blue-50   dark:bg-blue-900/30   text-blue-600   dark:text-blue-400",
    Design:   "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    Business: "bg-green-50  dark:bg-green-900/30  text-green-600  dark:text-green-400",
    General:  "bg-slate-100 dark:bg-slate-700     text-slate-600  dark:text-slate-300",
  };

  // ── Skeleton components ─────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden h-full flex flex-col animate-pulse">
      <div className="w-full h-44 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="mt-auto flex justify-between">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );

  const SkeletonFeatured = () => (
    <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-8 sm:mb-12 animate-pulse">
      {/* Responsive skeleton height */}
      <div className="w-full h-48 sm:h-64 md:h-[340px] bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 sm:p-8 flex flex-col gap-4">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-6 sm:h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="flex justify-between mt-2">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );

  const SkeletonGrid = () => (
    <>
      <SkeletonFeatured />
      {/* 1 col on mobile, 2 on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </>
  );

  // ── AuthorChip (original, unchanged) ───────────────────────────
  const AuthorChip = ({ post, size = "sm" }) => (
    <Link
      to={`/author/${post.author_id}`}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 hover:opacity-80 transition min-w-0"
    >
      {post.author_avatar ? (
        <img
          src={post.author_avatar}
          alt={post.author_name}
          className={`${size === "sm" ? "w-5 h-5" : "w-6 h-6"} rounded-full object-cover flex-shrink-0`}
        />
      ) : (
        <div className={`${size === "sm" ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0`}>
          {post.author_name?.charAt(0) || "?"}
        </div>
      )}
      <span className="hover:text-blue-600 dark:hover:text-blue-400 transition truncate">
        {post.author_name || "Unknown"}
      </span>
    </Link>
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    /*
      RESPONSIVE PADDING:
      · Mobile  : px-4  py-6   (tight, full-width feel)
      · Tablet  : px-6  py-8
      · Desktop : px-8  py-10  (original)
    */
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        {/*
          RESPONSIVE TYPOGRAPHY:
          · Mobile  : text-2xl  (readable, not overwhelming)
          · Tablet  : text-3xl
          · Desktop : text-4xl  (original)
        */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
          Latest Blog Posts
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
          Thoughts, ideas, and stories.
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      {/*
        Full width on all screens.
        min-h-[44px] ensures touch-friendly tap target.
      */}
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 sm:mb-6 px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
      />

      {/* ── Category Filter ──────────────────────────────────── */}
      {/*
        flex-wrap so chips wrap onto next line on small screens.
        Each button has min-h-[36px] for touch target.
      */}
      <div className="flex gap-2 flex-wrap mb-8 sm:mb-10 md:mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 sm:px-4 py-1.5 min-h-[36px] rounded-full text-xs sm:text-sm font-medium transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Featured Post ────────────────────────────────────── */}
      {!loading && featured && (
        <Link to={`/blog/${featured.slug}`} className="group block mb-8 sm:mb-12 md:mb-16">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-xl dark:hover:shadow-slate-900 transition">

            <div className="relative">
              {featured.thumbnail ? (
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  /*
                    RESPONSIVE IMAGE HEIGHT:
                    · Mobile  : h-48  (compact, doesn't dominate the screen)
                    · Tablet  : h-64
                    · Desktop : h-[340px]  (original)
                  */
                  className="w-full h-48 sm:h-64 md:h-[340px] object-cover"
                />
              ) : (
                <div className="w-full h-48 sm:h-64 md:h-[340px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-4xl sm:text-5xl">
                  🖼️
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* RESPONSIVE BODY PADDING: tighter on mobile */}
            <div className="p-5 sm:p-6 md:p-8">
              <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                categoryColors[formatCategory(featured.category)] || categoryColors.General
              }`}>
                {formatCategory(featured.category)}
              </span>

              {/*
                RESPONSIVE TITLE:
                · Mobile  : text-xl
                · Tablet  : text-2xl
                · Desktop : text-3xl (original)
              */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                {featured.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mt-3 border-l-4 border-blue-400 dark:border-blue-500 pl-4 line-clamp-2 overflow-hidden [word-break:break-word] [overflow-wrap:anywhere] text-sm sm:text-base">
                {featured.description || "No description available."}
              </p>

              {/*
                RESPONSIVE META ROW:
                · Mobile  : stack vertically (flex-col)
                · Desktop : side by side (sm:flex-row)
              */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-5 sm:mt-6 text-sm text-slate-500 dark:text-slate-400">
                <span>{new Date(featured.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-3 flex-wrap">
                  <AuthorChip post={featured} size="md" />
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>Posted {getRelativeTime(featured.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Skeletons ────────────────────────────────────────── */}
      {loading && <SkeletonGrid />}

      {/* ── Post Grid ────────────────────────────────────────── */}
      {!loading && (
        <>
          {/*
            RESPONSIVE GRID:
            · Mobile  : 1 column   (full-width cards, easy to read)
            · Tablet  : 2 columns  (sm:grid-cols-2)
            · Desktop : 2 columns  (md:grid-cols-2) — original behaviour
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            {rest.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900 hover:-translate-y-1 transition h-full flex flex-col">

                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-44 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-3xl flex-shrink-0">
                      🖼️
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium self-start ${
                      categoryColors[formatCategory(post.category)] || categoryColors.General
                    }`}>
                      {formatCategory(post.category)}
                    </span>

                    <h3 className="text-lg sm:text-xl font-semibold mt-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 overflow-hidden border-l-4 border-blue-400 dark:border-blue-500 pl-3 [word-break:break-word] [overflow-wrap:anywhere]">
                      {post.description || "No description available."}
                    </p>

                    {/*
                      META ROW:
                      · Mobile: stack author + date vertically to prevent overflow
                      · Desktop: row layout
                    */}
                    <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <AuthorChip post={post} size="sm" />
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span>Posted {getRelativeTime(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 sm:py-20 text-slate-400 dark:text-slate-500 text-sm sm:text-base">
              No posts found.
            </div>
          )}
        </>
      )}
    </div>
  );
} 