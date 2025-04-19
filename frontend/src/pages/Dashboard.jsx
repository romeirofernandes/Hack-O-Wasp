import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { SplashCursor } from "../components/AnimatedBackground";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080808] flex flex-col">
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
      <Navbar />
      
      <div className="container relative z-10 mx-auto px-4 py-24 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-white">Your Dashboard</h2>
          
          {/* User Profile Card */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl text-white">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-white">{user?.displayName}</h3>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">7 days</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Learning Score</p>
                <p className="text-2xl font-bold text-white">89</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <h3 className="text-2xl font-semibold mb-4 text-white">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all">
              <div className="text-white text-lg mb-2 font-medium">Upload</div>
              <p className="text-gray-400 text-sm">Import notes, PDFs or videos</p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">→</div>
            </button>
            <button className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all">
              <div className="text-white text-lg mb-2 font-medium">Learn</div>
              <p className="text-gray-400 text-sm">Practice with flashcards</p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">→</div>
            </button>
            <button className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all">
              <div className="text-white text-lg mb-2 font-medium">Quiz</div>
              <p className="text-gray-400 text-sm">Test your knowledge</p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">→</div>
            </button>
          </div>
          
          {/* Recent Activity */}
          <h3 className="text-2xl font-semibold mb-4 text-white">Recent Activity</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Machine Learning Basics</h4>
                  <p className="text-gray-400 text-sm">PDF • 3 days ago</p>
                </div>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm">
                  Review
                </button>
              </div>
            </div>
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Interview Preparation</h4>
                  <p className="text-gray-400 text-sm">Notes • 5 days ago</p>
                </div>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm">
                  Review
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Data Structures</h4>
                  <p className="text-gray-400 text-sm">Video • 1 week ago</p>
                </div>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm">
                  Review
                </button>
              </div>
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Upcoming Deadlines</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-8 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Google Technical Interview</h4>
                  <p className="text-gray-400 text-sm">In 3 days</p>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                  Urgent
                </span>
              </div>
            </div>
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Microsoft Resume Submission</h4>
                  <p className="text-gray-400 text-sm">In 1 week</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                  Important
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">Amazon Coding Challenge</h4>
                  <p className="text-gray-400 text-sm">In 2 weeks</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} InternGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;