import { pool } from "../db.js";

// GET CURRENT USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, avatar, bio, username FROM users WHERE id = $1",
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    // Build dynamic UPDATE — only set columns provided in the request body.
    const fields = [];
    const values = [];
    let idx = 1;

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      fields.push(`name=$${idx++}`);
      values.push(body.name);
    }

    if (Object.prototype.hasOwnProperty.call(body, "avatar")) {
      fields.push(`avatar=$${idx++}`);
      values.push(body.avatar);
    }

    if (Object.prototype.hasOwnProperty.call(body, "bio")) {
      fields.push(`bio=$${idx++}`);
      values.push(body.bio);
    }

    if (Object.prototype.hasOwnProperty.call(body, "username")) {
      const username = body.username;
      if (username === "") {
        // Explicitly unset username
        fields.push(`username=$${idx++}`);
        values.push(null);
      } else {
        // Check uniqueness excluding current user
        const r = await pool.query(
          "SELECT id FROM users WHERE username = $1 AND id <> $2",
          [username, userId]
        );
        if (r.rowCount > 0) return res.status(409).json({ message: "Username already exists" });
        fields.push(`username=$${idx++}`);
        values.push(username);
      }
    }

    if (fields.length === 0) {
      // Nothing to update — return current profile
      const r = await pool.query(
        "SELECT id, name, email, avatar, bio, username FROM users WHERE id = $1",
        [userId]
      );
      return res.json(r.rows[0]);
    }

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id=$${idx} RETURNING id, name, email, avatar, bio, username`;
    values.push(userId);

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// CHECK USERNAME AVAILABILITY
export const checkUsername = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).json({ message: "username is required" });

    const result = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    return res.json({ exists: result.rowCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking username" });
  }
};