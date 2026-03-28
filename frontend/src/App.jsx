import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Home from "./Home.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";
import MovieTrailerPage from "./components/MovieTrailerPage.jsx";
import Registration from "./pages/Registration.jsx"; 
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; 
import Profile from "./pages/Profile.jsx";
import Favorites from "./pages/Favorites.jsx";
import { getMe, logout, setAuthToken, verifyEmail } from "./api";

function App() {
  const blueGradientBg = "linear-gradient(180deg, #0b1f14 0%, #123524 36%, #1b4d33 68%, #2a6a45 100%)";
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);

  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(() =>
    typeof window !== "undefined" ? Boolean(new URLSearchParams(window.location.search).get("resetToken")) : false
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authBanner, setAuthBanner] = useState(null);
  const transitionTimerRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const [initialPasswordResetToken, setInitialPasswordResetToken] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("resetToken") : null
  );

  const handleConsumedPasswordResetLink = useCallback(() => {
    setInitialPasswordResetToken(null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyEmailToken = params.get("verifyEmailToken");
    const resetToken = params.get("resetToken");

    const stripFromUrl = (...keys) => {
      keys.forEach((k) => params.delete(k));
      const q = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);
    };

    if (verifyEmailToken) {
      stripFromUrl("verifyEmailToken");
      (async () => {
        try {
          const data = await verifyEmail(verifyEmailToken);
          setAuthBanner({ type: "success", message: data.message });
        } catch (e) {
          const msg =
            typeof e?.body === "object" && e?.body?.error != null ? e.body.error : e.message;
          setAuthBanner({ type: "error", message: msg });
        }
      })();
    }

    if (resetToken) {
      stripFromUrl("resetToken");
    }
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("ces_auth_token");
      if (!token) return;
      setAuthToken(token);
      try {
        const me = await getMe();
        setCurrentUser({
          ...me.user,
          favoriteMovies: me.favoriteMovies ?? []
        });
      } catch {
        setAuthToken("");
        setCurrentUser(null);
      }
    }
    restoreSession();
  }, []);

  const runPageTransition = (action) => {
    if (isLoggingOutRef.current || isPageTransitioning) return;
    setShowUserMenu(false);
    setIsPageTransitioning(true);
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      action();
      setIsPageTransitioning(false);
      transitionTimerRef.current = null;
    }, 1000);
  };

  const goHomeImmediate = () => {
    setShowRegistration(false);
    setShowLogin(false);
    setShowProfile(false);
    setShowFavorites(false);
    setSelectedMovie(null);
    setTrailerMovie(null);
    setShowUserMenu(false);
  };

  const handleLoginSuccess = (authData) => {
    runPageTransition(() => {
      setAuthToken(authData.token);
      setCurrentUser(authData.user);
      goHomeImmediate();
    });
  };

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setIsPageTransitioning(false);
    try {
      await Promise.all([
        logout(),
        new Promise((resolve) => setTimeout(resolve, 1800))
      ]);
    } catch {
      // ignore logout network errors in client-side token flow
      await new Promise((resolve) => setTimeout(resolve, 1800));
    }
    setAuthToken("");
    setCurrentUser(null);
    setShowProfile(false);
    setShowLogin(false);
    setShowRegistration(false);
    setSelectedMovie(null);
    setTrailerMovie(null);
    setShowUserMenu(false);
    setIsLoggingOut(false);
    isLoggingOutRef.current = false;
  };

  // --- ADDED THIS FUNCTION ---
  // This allows the Home page to update the user's favorites without losing them!
  const handleUpdateUserFavorites = (newFavoritesList) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        favoriteMovies: newFavoritesList
      });
    }
  };
  // ---------------------------

  const getUserInitials = () => {
    if (!currentUser) return "U";
    const first = currentUser.firstName?.trim()?.[0] ?? "";
    const last = currentUser.lastName?.trim()?.[0] ?? "";
    const initials = `${first}${last}`.toUpperCase();
    if (initials) return initials;
    const emailInitial = currentUser.email?.trim()?.[0];
    return (emailInitial ? emailInitial.toUpperCase() : "U");
  };

  const openHome = () => runPageTransition(goHomeImmediate);

  const openLogin = () =>
    runPageTransition(() => {
      setShowRegistration(false);
      setShowLogin(true);
      setShowProfile(false);
      setShowFavorites(false);
      setSelectedMovie(null);
      setTrailerMovie(null);
      setShowUserMenu(false);
    });

  const openRegistration = () =>
    runPageTransition(() => {
      setShowRegistration(true);
      setShowLogin(false);
      setShowProfile(false);
      setShowFavorites(false);
      setSelectedMovie(null);
      setTrailerMovie(null);
      setShowUserMenu(false);
    });

  const openProfile = () => {
    if (!currentUser) return;
    runPageTransition(() => {
      setShowProfile(true);
      setShowFavorites(false);
      setShowLogin(false);
      setShowRegistration(false);
      setSelectedMovie(null);
      setTrailerMovie(null);
      setShowUserMenu(false);
    });
  };

  const openFavorites = () => {
    if (!currentUser) return;
    runPageTransition(() => {
      setShowFavorites(true);
      setShowProfile(false);
      setShowLogin(false);
      setShowRegistration(false);
      setSelectedMovie(null);
      setTrailerMovie(null);
      setShowUserMenu(false);
    });
  };

  const renderContent = () => {
    if (showRegistration) {
      return (
        <div style={{ background: blueGradientBg, minHeight: "calc(100vh - 72px)", color: "white" }}>
          <Registration />
        </div>
      );
    }

    if (showLogin) {
      return (
        <div style={{ background: blueGradientBg, minHeight: "calc(100vh - 72px)", color: "white" }}>
          <Login
            onLoginSuccess={handleLoginSuccess}
            initialPasswordResetToken={initialPasswordResetToken}
            onConsumedPasswordResetLink={handleConsumedPasswordResetLink}
          />
        </div>
      );
    }

    if (showProfile && currentUser) {
      return (
        <div style={{ background: "#f3f3f3", minHeight: "calc(100vh - 72px)" }}>
          <Profile
            onBack={() => runPageTransition(goHomeImmediate)}
            onUserRefreshed={(user, favoriteMovies) => {
              if (isLoggingOutRef.current) {
                return;
              }
              setCurrentUser({
                ...user,
                favoriteMovies
              });
            }}
          />
        </div>
      );
    }

    if (showFavorites && currentUser) {
      return (
        <div style={{ background: blueGradientBg, minHeight: "calc(100vh - 72px)" }}>
          <Favorites
            currentUser={currentUser}
            onBack={openHome}
            onSelectMovie={(movie) => runPageTransition(() => setSelectedMovie(movie))}
            onViewTrailer={(movie) => runPageTransition(() => setTrailerMovie(movie))}
            onUpdateFavorites={handleUpdateUserFavorites}
          />
        </div>
      );
    }

    if (trailerMovie) {
      return <MovieTrailerPage movie={trailerMovie} goBack={() => runPageTransition(() => setTrailerMovie(null))} />;
    }

    if (selectedMovie) {
      return <BookingPrototype movie={selectedMovie} goBack={() => runPageTransition(() => setSelectedMovie(null))} />;
    }

    return (
      <div style={{ background: blueGradientBg, minHeight: "calc(100vh - 72px)" }}>
        {currentUser?.role === "ADMIN" ? (
          <AdminDashboard currentUser={currentUser} />
        ) : (
          <Home
            onSelectMovie={(movie) => runPageTransition(() => setSelectedMovie(movie))}
            onViewTrailer={(movie) => runPageTransition(() => setTrailerMovie(movie))}
            currentUser={currentUser}
            onUpdateFavorites={handleUpdateUserFavorites}
          />
        )}
      </div>
    );
  };

  return (
    <div className="app-shell">
      {authBanner && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            textAlign: "center",
            background: authBanner.type === "error" ? "#fee2e2" : "#dcfce7",
            color: authBanner.type === "error" ? "#991b1b" : "#166534",
            borderBottom: `1px solid ${authBanner.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          }}
        >
          {authBanner.message}
          <button
            type="button"
            onClick={() => setAuthBanner(null)}
            style={{
              marginLeft: "16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              color: "inherit",
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {isPageTransitioning && (
        <div className="app-transition-overlay" role="status" aria-live="polite">
          <div className="app-transition-loader" />
          <div className="app-transition-text">Loading...</div>
        </div>
      )}
      {isLoggingOut && (
        <div className="app-logout-overlay" role="status" aria-live="polite">
          <div className="app-logout-loader" />
          <div className="app-logout-text">Processing logout...</div>
        </div>
      )}
      {showUserMenu && (
        <button
          type="button"
          className="app-menu-overlay"
          onClick={() => setShowUserMenu(false)}
          aria-label="Close account menu"
        />
      )}

      <nav className="app-navbar">
        <button className="app-brand" onClick={openHome}>
          Cinema E-Booking
        </button>

        <div className="app-navbar-actions">
          {currentUser ? (
            <div className="app-user-menu-anchor">
              <button
                className="app-avatar-btn"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                title="Open account menu"
              >
                {getUserInitials()}
              </button>
              {showUserMenu && (
                <div className="app-user-menu" role="menu" aria-label="User menu">
                  <div className="app-user-menu-welcome">Welcome, {currentUser.firstName}!</div>
                  <button className="app-user-menu-item" role="menuitem" onClick={openProfile}>
                    My account
                  </button>
                  <button className="app-user-menu-item" role="menuitem" onClick={openFavorites}>
                    My favorites
                  </button>
                  <button className="app-user-menu-item app-user-menu-item-danger" role="menuitem" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="app-nav-btn app-nav-btn-login" onClick={openLogin}>
                Login
              </button>
              <button className="app-nav-btn app-nav-btn-register" onClick={openRegistration}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {renderContent()}
    </div>
  );
}

export default App;