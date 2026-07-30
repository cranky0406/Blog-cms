import { pool } from "../db.js";
import { sanitizeText } from "../utils/sanitize.js";

// GET COMMENTS FOR A POST (public)
export const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        comments.id,
        comments.body,
        comments.created_at,
        comments.user_id,
        users.name AS author_name,
        users.avatar AS author_avatar
       FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err.message);
    res.status(500).json({ error: "Error fetching comments" });
  }
};

// ADD COMMENT (logged-in users only)
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { body } = req.body;
  const userId = req.user.id;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Comment body is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, sanitizeText(body.trim())]
    );

    // Return comment with author info so the frontend can render immediately
    const comment = await pool.query(
      `SELECT
        comments.id,
        comments.body,
        comments.created_at,
        comments.user_id,
        users.name AS author_name,
        users.avatar AS author_avatar
       FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(comment.rows[0]);
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err.message);
    res.status(500).json({ error: "Error adding comment" });
  }
};

// DELETE COMMENT (comment owner or post author)
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Allow deletion if user owns the comment OR owns the post the comment is on
    const result = await pool.query(
      `DELETE FROM comments
       WHERE comments.id = $1
         AND (
           comments.user_id = $2
           OR EXISTS (
             SELECT 1 FROM posts WHERE posts.id = comments.post_id AND posts.user_id = $2
           )
         )
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err.message);
    res.status(500).json({ error: "Error deleting comment" });
  }
};
