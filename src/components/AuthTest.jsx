import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Hämta aktuell användare vid mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) setError(error.message);
      else setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Inloggad:", data.session.user);
      } else {
        console.warn("Ingen session hittades");
      }
    };
    getSession();
  }, []);

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setUser(data.user);
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else setUser(data.user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // eller en specifik URL
      },
    });
    if (error) console.error("OAuth error:", error.message);
  };

  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Supabase Auth Test</h2>

      {user ? (
        <div>
          <p className="mb-2">
            Inloggad som: <strong>{user.email}</strong>
          </p>
          <p>Hej {user.user_metadata.full_name}</p>
          {console.log(user)}
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logga ut
          </button>
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSignUp}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Registrera
            </button>
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Logga in
            </button>
            <button
              onClick={handleGoogleLogin}
              className="bg-yellow-500 text-white px-4 py-2 rounded mt-4"
            >
              Logga in med Google
            </button>
   
          </div>
        </>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
