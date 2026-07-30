import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { FaTrash } from "react-icons/fa";
import API_BASE from "../api";
import { authFetch } from "../utils/csrfUtils";

export default function CommentSection({ postId, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        setLoadingComments(true);

        const fetchComments = fetch(`${API_BASE}/api/comments/${postId}`, {
          credentials: "include",
        }).then((r) => r.json());

        const fetchMe = fetch(`${API_BASE}/api/users/me`, {
          credentials: "include",
        }).then((r) => (r.ok ? r.json() : null));

        Promise.all([fetchComments, fetchMe])
          .then(([commentData, userData]) => {
            setComments(Array.isArray(commentData) ? commentData : []);
            setCurrentUser(userData || null);
          })
          .finally(() => setLoadingComments(false));
      },
      { rootMargin: "200px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [postId]);

  const getRelativeTime = (value) => {
    const created = new Date(value);
    const diffMs = Date.now() - created.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return "just now";
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/api/comments/${postId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment");
        return;
      }

      setComments((prev) => [...prev, data]);
      setBody("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await authFetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  return (
    <section ref={sectionRef} className="w-full px-8 pb-20">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        Comments ({comments.length})
      </h2>

      {/* Comment input */}
      {currentUser !== undefined && (currentUser ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-start gap-3">
            {/* Current user avatar */}
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold uppercase flex-shrink-0 mt-1">
                {currentUser.name?.charAt(0) || "?"}
              </div>
            )}

            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
          <a href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Log in
          </a>{" "}
          to leave a comment.
        </div>
      ))}

      {/* Comments list */}
      {loadingComments ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.user_id || currentUser.id === postAuthorId);

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"
              >
                {/* Author avatar */}
                {comment.author_avatar ? (
                  <img
                    src={comment.author_avatar}
                    alt={comment.author_name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold uppercase flex-shrink-0">
                    {comment.author_name?.charAt(0) || "?"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">
                        {comment.author_name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {getRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        title="Delete comment"
                        className="text-red-400 hover:text-red-600 dark:hover:text-red-500 transition flex-shrink-0"
                      >
                        <FaTrash size={13} />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed [word-break:break-word] [overflow-wrap:anywhere]">
                    {DOMPurify.sanitize(comment.body)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
