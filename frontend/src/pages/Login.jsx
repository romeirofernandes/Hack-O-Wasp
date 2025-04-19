import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../Api/Auth";
import { SplashCursor } from "../components/AnimatedBackground";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Google authentication error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-0 min-h-screen bg-[#080808]">
      <SplashCursor
        SIM_RESOLUTION={64}
        DYE_RESOLUTION={512}
        CAPTURE_RESOLUTION={256}
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1.5}
        PRESSURE_ITERATIONS={10}
        CURL={2}
        SPLAT_RADIUS={0.15}
        SPLAT_FORCE={4000}
        COLOR_UPDATE_SPEED={2}
        BACK_COLOR={{ r: 0.05, g: 0.05, b: 0.05 }}
      />

      <nav className="fixed top-3 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-sm max-w-4xl mx-auto px-2 py-1 rounded-full border border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-white font-bold text-xl">
            InternGuide
          </Link>
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md mx-auto p-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
          
          <div className="mt-8 text-center text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-white hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} InternGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Login;