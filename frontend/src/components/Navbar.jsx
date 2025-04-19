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
    <div className="sticky top-0 z-50 pb-8"> {/* Added pt-3 to match the nav top-3 spacing */}
      <nav className="fixed top-3 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-sm max-w-4xl mx-auto px-2 py-1 rounded-full border border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
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
                    {/* {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    )} */}
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
  );
};

export default Navbar;