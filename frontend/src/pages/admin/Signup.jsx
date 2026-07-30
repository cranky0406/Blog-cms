import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import showIcon from "../../assets/show.svg";
import hideIcon from "../../assets/hide.svg";
import API_BASE from "../../api";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    emailPrefix: "",
    phone: "",
    password: "",
  });

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneRegistered, setPhoneRegistered] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If user edits phone, clear previous verification/registration state
    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: value }));
      setPhoneRegistered(false);
      setPhoneVerified(false);
      return;
    }

    // Special handling for emailPrefix validation
    if (name === "emailPrefix") {
      const v = value.trim();
      setForm((prev) => ({ ...prev, emailPrefix: v }));

      // If user includes an @, accept only @uxism.org (case-insensitive)
      if (v.includes("@")) {
        const lower = v.toLowerCase();
        if (!lower.endsWith("@uxism.org")) {
          setEmailError("Only @uxism.org addresses are allowed. Enter only the prefix or use @uxism.org.");
        } else {
          setEmailError(null);
        }
      } else {
        // basic prefix validation: no spaces
        if (v.includes(" ") || v.length === 0) {
          setEmailError("Enter a valid email prefix (no spaces).");
        } else {
          setEmailError(null);
        }
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneVerified) {
      alert("Please verify your phone first.");
      return;
    }

    if (usernameAvailable !== true) {
      alert("Please check that your username is available.");
      return;
    }

    // Determine and validate final email
    let finalEmail = form.emailPrefix || "";
    if (finalEmail.includes("@")) {
      if (!finalEmail.toLowerCase().endsWith("@uxism.org")) {
        alert("Email must be on @uxism.org domain.");
        return;
      }
    } else {
      finalEmail = `${finalEmail}@uxism.org`;
    }

    const payload = {
      name: form.name,
      username: form.username,
      email: finalEmail,
      password: form.password,
      phone: form.phone,
    };

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Signup failed");
        return;
      }

      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const verifyPhone = async () => {
    if (!form.phone) return alert("Phone is required");
    setVerifyingPhone(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();
      // If our backend reports this phone is already registered, inform the user now
      if (data && data.registered) {
        setPhoneRegistered(true);
        alert("This phone number is already registered. Please login or use a different phone number.");
        setVerifyingPhone(false);
        return;
      }

      if (!res.ok) {
        alert(data.message || data.error || "Verification failed");
        setVerifyingPhone(false);
        return;
      }

      if (data.exists && data.status === "active") {
        setPhoneVerified(true);
        alert("Phone verified — active");
      } else {
        alert("Phone not active — purchase required");
      }
    } catch (err) {
      console.error(err);
      alert("Verification error");
    } finally {
      setVerifyingPhone(false);
    }
  };

  const checkUsername = async () => {
    if (!form.username) return alert("Enter a username to check");
    setCheckingUsername(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/check-username?username=${encodeURIComponent(form.username)}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "Username check failed");
        setCheckingUsername(false);
        return;
      }

      if (data.exists) {
        setUsernameAvailable(false);
        alert("Username exists");
      } else {
        setUsernameAvailable(true);
        alert("Username is available");
      }
    } catch (err) {
      console.error(err);
      alert("Error checking username");
    } finally {
      setCheckingUsername(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">

      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-400 font-medium"
        >
          ← Back to Website
        </Link>
      </div>

      <div className={`bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-8 transition-all duration-300`}>
        <h1 className="text-3xl font-bold mb-2 text-center text-slate-900 dark:text-white">Signup</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8 text-center">Create your account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none p-3 rounded-xl mb-4 transition"
            onChange={handleChange}
            required
          />

          <div className="flex gap-2 mb-3">
            <input
              type="tel"
              name="phone"
              placeholder="Phone (e.g. +1234567890)"
              className="flex-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none p-3 rounded-xl transition"
              onChange={handleChange}
              required
              disabled={phoneVerified}
            />
            <button
              type="button"
              onClick={verifyPhone}
              disabled={verifyingPhone || !form.phone || phoneVerified}
              className={`px-4 py-2 rounded ${phoneVerified ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
            >
              {phoneVerified ? 'Verified' : (verifyingPhone ? 'Verifying...' : 'Verify')}
            </button>
          </div>
          {phoneRegistered && (
            <div className="text-sm text-red-600 mb-3">
              This phone is already registered. <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Login</span>.
              <button
                type="button"
                className="ml-2 text-sm text-blue-600 underline"
                onClick={() => {
                  setForm(prev => ({ ...prev, phone: '' }));
                  setPhoneRegistered(false);
                }}
              >
                Use different number
              </button>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="flex-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none p-3 rounded-xl transition"
              onChange={handleChange}
              required
              disabled={!phoneVerified}
            />
            <button
              type="button"
              onClick={checkUsername}
              disabled={checkingUsername || !form.username || !phoneVerified}
              className={`px-4 py-2 rounded border border-gray-300 dark:border-slate-600 bg-gray-200 text-slate-900 dark:bg-slate-600 dark:text-white ${checkingUsername || !form.username || !phoneVerified ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-95'}`}
            >
              {checkingUsername ? 'Checking...' : 'Check'}
            </button>
          </div>

          <div className="flex mb-3">
            <input
              type="text"
              name="emailPrefix"
              placeholder="Email prefix"
              className="flex-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none p-3 rounded-l-xl transition"
              onChange={handleChange}
              required
              disabled={!phoneVerified}
            />
            <span className="inline-flex items-center px-3 border rounded-r-xl bg-gray-100 text-slate-700 border-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">@uxism.org</span>
          </div>
          {emailError && <div className="text-sm text-red-500 mb-3">{emailError}</div>}

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none p-3 rounded-xl pr-14 transition"
              onChange={handleChange}
              required
              disabled={!phoneVerified}
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition duration-200 active:scale-90"
            >
              <img src={showPassword ? hideIcon : showIcon} alt="toggle" className="w-6 h-6 opacity-60 dark:invert brightness-10 contrast-150 transition-all duration-300 cursor-pointer rotate-0 scale-80" />
            </button>
          </div>
          {capsLock && <p className="text-orange-500 text-sm mb-2">Caps Lock is ON</p>}

          <button
            type="submit"
            disabled={!phoneVerified || usernameAvailable !== true || !!emailError || !form.emailPrefix}
            className={`w-full ${(!phoneVerified || usernameAvailable !== true || !!emailError || !form.emailPrefix) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition duration-200 shadow-lg`}
          >
            Signup
          </button>

          <p className="mt-4 text-sm text-center">
            Already have an account? {" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
