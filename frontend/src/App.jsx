import { useState, useEffect } from "react";
import Home from "./pages/home";
import Landing from "./pages/landing";
import About from "./pages/about";
import Services from "./pages/services";
import Contact from "./pages/contact";
import Auth from "./pages/auth";
import LoadingScreen from "./components/LoadingScreen";
import InteractiveBackground from "./components/InteractiveBackground";
import AuthTransitionBuffer from "./components/AuthTransitionBuffer";
import { supabase } from "./services/supabase";
import { decryptName } from "./services/encryption";
import { getUserPlan } from "./utils/subscription";
import AdminPanel from "./components/AdminPanel";
import { useDialog } from "./context/DialogContext";
import "./css/App.css";

function App() {
  const { showAlert } = useDialog();
  const [route, setRoute] = useState(() => {
    try {
      const savedRoute = sessionStorage.getItem("resora-route");
      if (savedRoute) {
        const parsed = JSON.parse(savedRoute);
        if (parsed.page === "loading") {
          return { page: "landing", profession: null };
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return { page: "landing", profession: null };
  });

  const [isExitingBuilder, setIsExitingBuilder] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [user, setUser] = useState(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const isAdmin = user && user.email === (import.meta.env.VITE_ADMIN_EMAIL || "nezer.resora@gmail.com");
  const [plan, setPlan] = useState(() => getUserPlan(null));

  useEffect(() => {
    setPlan(getUserPlan(user));
  }, [user]);


  const [showAuthTransition, setShowAuthTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("Preparing your space...");
  const [mascotMood, setMascotMood] = useState("normal");
  const [isHeaderScrolledOut, setIsHeaderScrolledOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setIsHeaderScrolledOut(false);
  }, [route.page]);

  useEffect(() => {
    try {
      sessionStorage.setItem("resora-route", JSON.stringify(route));
    } catch (e) {
      // ignore
    }
    setMascotMood("normal"); // Reset mascot mood on route change
    setIsSigningOut(false);   // Reset signing out state
  }, [route]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleBackToLanding = () => {
    setIsExitingBuilder(true);
    setRoute((prev) => ({ ...prev, page: "landing" }));
    setTimeout(() => {
      setIsExitingBuilder(false);
      setRoute({ page: "landing", profession: null });
    }, 850);
  };

  const handleLoadingComplete = () => {
    setRoute({ page: "builder", profession: route.profession });
    setTimeout(() => {
      setShowLoader(false);
    }, 500);
  };

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 40) {
      setIsHeaderScrolledOut(true);
    } else {
      setIsHeaderScrolledOut(false);
    }
  };

  const transitionToPage = (targetPage, customMessage, useBuffer = true) => {
    if ((route.page === "auth" || targetPage === "auth") && useBuffer) {
      setTransitionMessage(customMessage || "Preparing your space...");
      setShowAuthTransition(true);
      setTimeout(() => {
        setRoute({ page: targetPage, profession: null });
      }, 550);
      setTimeout(() => {
        setShowAuthTransition(false);
      }, 1450);
    } else {
      setRoute({ page: targetPage, profession: null });
    }
  };

  const isHeaderHidden = ["auth", "builder", "loading"].includes(route.page);

  const wrapperClass = route.page === "builder"
    ? "slider-wrapper on-builder"
    : isExitingBuilder
      ? "slider-wrapper exit-builder"
      : "slider-wrapper";

  // Render a smooth sliding transition container for landing <-> about <-> auth page views
  return (
    <>
      <div className={wrapperClass}>
        <InteractiveBackground />

        {/* Static parent header that does not slide with the page contents */}
        <header className={`landing-header ${isHeaderHidden ? "header-hidden" : ""} ${isHeaderScrolledOut ? "header-scrolled-out" : ""}`}>
          <a href="/" className="logo-container" onClick={(e) => { e.preventDefault(); setRoute({ page: "landing", profession: null }); }}>
            <svg className="logo-svg" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="parentHeaderBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              {/* Body */}
              <circle cx="17" cy="21" r="9.5" fill="url(#parentHeaderBodyGrad)" />
              {/* Hat Brim */}
              <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
              {/* Hat Ribbon */}
              <rect x="10" y="8" width="14" height="1.5" fill="#ea580c" />
              {/* Hat Crown */}
              <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
              {/* Eyes */}
              <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="13.5" cy="19" r="1.1" fill="#0f172a" />
              <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="1.1" fill="#0f172a" />
              {/* Monocle */}
              <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" strokeWidth="0.9" fill="none" />
              <path d="M23.5 21.5 C25 24 24 26 22 28.5" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1.2 0.8" fill="none" />
              {/* Mustache */}
              <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
            </svg>
            <span className="logo-brand">
              Resora <span className="logo-subtext" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setRoute({ page: "about", profession: null }); }}>by Nezer</span>
            </span>
          </a>
          <nav className="nav-menu">
            <a href="#" className={`nav-link ${route.page === "landing" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); transitionToPage("landing"); }}>
              Home
            </a>
            <a href="#" className={`nav-link ${route.page === "about" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); transitionToPage("about"); }}>
              About Us
            </a>
            <a href="#" className={`nav-link ${route.page === "services" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); transitionToPage("services"); }}>
              Service
            </a>
            <a href="#" className={`nav-link ${route.page === "contact" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); transitionToPage("contact"); }}>
              Contact
            </a>
            {user ? (
              <div className="user-profile-header">
                {isAdmin && (
                  <button
                    type="button"
                    className="nav-link admin-nav-btn"
                    onClick={() => setAdminPanelOpen(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginRight: "1rem", color: "#ea580c", fontWeight: "700" }}
                  >
                    👑 Admin Panel
                  </button>
                )}
                {route.page === "landing" && (
                  <span className="user-greeting">
                    Hi, {(decryptName(user.user_metadata?.full_name, user.id) || user.email.split('@')[0]).trim().split(/\s+/)[0]}!
                  </span>
                )}
                <button
                  className="nav-btn-signin signout-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsSigningOut(true);
                    setMascotMood("frantic");
                    await supabase.auth.signOut();
                    transitionToPage("auth", "See you again!");
                  }}
                  onMouseEnter={() => setMascotMood("frantic")}
                  onMouseLeave={() => {
                    if (!isSigningOut) {
                      setMascotMood("normal");
                    }
                  }}
                  aria-label="Sign Out"
                >
                  <span className="signout-text">Sign Out</span>
                  <svg className="signout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <a
                href="#"
                className="nav-btn-signin"
                onClick={(e) => { e.preventDefault(); setRoute({ page: "auth", profession: null }); }}
                onMouseEnter={() => {
                  if (!isSigningOut) {
                    setMascotMood("excited");
                  }
                }}
                onMouseLeave={() => {
                  if (!isSigningOut) {
                    setMascotMood("normal");
                  }
                }}
              >
                Sign In
              </a>
            )}
          </nav>
        </header>

        <div className={`slider-track slide-to-${route.page === "loading" ? "loading" : route.page}`}>
          <div className="slide-item" onScroll={handleScroll}>
            <Landing
              key={route.page === "landing" ? "landing-active" : "landing-inactive"}
              user={user}
              onSelect={(p) => {
                setRoute({ page: "loading", profession: p });
                setShowLoader(true);
              }}
              onNavigate={transitionToPage}
              isEmbedded
              mascotMood={mascotMood}
              onMascotMoodChange={setMascotMood}
              plan={plan}
            />
          </div>
          <div className="slide-item about-slide-item" onScroll={handleScroll}>
            <About
              onNavigate={transitionToPage}
              isEmbedded
            />
          </div>
          <div className="slide-item" onScroll={handleScroll}>
            <Services
              onNavigate={transitionToPage}
              isEmbedded
              onMascotMoodChange={setMascotMood}
            />
          </div>
          <div className="slide-item" onScroll={handleScroll}>
            <Contact
              onNavigate={transitionToPage}
              isEmbedded
              onMascotMoodChange={setMascotMood}
            />
          </div>
          <div className="slide-item" onScroll={handleScroll}>
            <Auth
              user={user}
              onNavigate={(page) => transitionToPage(page, null, false)}
              onSuccessNavigate={(page, msg) => transitionToPage(page, msg, true)}
            />
          </div>
        </div>
      </div>

      {(route.page === "builder" || isExitingBuilder) && (
        <div className={`editor-overlay-container ${isExitingBuilder ? "exit-under" : "active-top"}`}>
          <Home
            profession={route.profession}
            user={user}
            onBack={handleBackToLanding}
            plan={plan}
          />
        </div>
      )}

      {showLoader && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
        />
      )}

      <AuthTransitionBuffer active={showAuthTransition} message={transitionMessage} />

      <AdminPanel
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        user={user}
      />
    </>
  );
}

export default App;
