import { useEffect } from "react";
import { supabase } from "../utils/supabase.js";


export default function UserAuth({ colors, user, setUser }) {
  //const [user, setUser] = useState(null);
  //const [error, setError] = useState(null);

  // Hämta aktuell användare vid mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("getUser() - Error fetching user:", error.message);
        //   setError(error.message);
      } else {
        console.log("getUser() - Current user:", data.user);
        setUser(data.user);
      }
    };
    getUser();
  }, [setUser]);

  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data, error } = await supabase.auth.getSession();
  //     if (data.session) {
  //       console.log("getSession() - Inloggad:", data.session.user);
  //     } else {
  //       console.log("getSession() - Ingen session hittades. ", error);
  //     }
  //   };
  //   getSession();
  // }, []);

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
    else setUser(data.user);
  };

  return (
    <div className="p-4 ">
      {user ? (
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-80"
          style={{
            backgroundColor: colors._card,
            color: colors._negative,
            border: `1px solid ${colors._border}`,
          }}
        >
          {/* {user.user_metadata.full_name.split(' ')[0]} */}
          <img
            src={user.user_metadata.picture}
            alt="Profilbild"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">Logga ut</span>
        </button>
      ) : (
        <button
          onClick={handleGoogleLogin}
          //   className="flex items-center justify-center w-25 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md hover:border-gray-400 active:bg-gray-100 transition-all duration-200"
          // className="w-25 h-10 px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:opacity-80"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-80"
          style={{
            //   backgroundColor: colors.primary,
            //   color: colors.background,
            backgroundColor: colors._card,
            color: colors._text,
            border: `1px solid ${colors._border}`,
          }}
        >
          Logga in
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </button>
      )}
      {/* 
       {error && console.error(error)}
     {error && <p className="text-red-600 mt-4">{error}</p>} 
     */}
    </div>
  );
}
