import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase.config";
import { logout } from "../api/Auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Transparent fixed wrapper to hold the pill navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-3 pb-3">
        <nav className="max-w-4xl mx-auto px-2 py-1 bg-[#080808]/80 backdrop-blur-sm rounded-full border border-white/10 shadow-md">
          <div className="px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Clarity Ai
            </Link>
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-transparent text-white border border-white/20 hover:bg-white/5 rounded-full font-medium transition-all"
                  >
                    Logout
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm hidden md:block">
                      {user.displayName || user.email}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-white text-black hover:bg-gray-100 rounded-full font-medium transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from going under the navbar */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;
