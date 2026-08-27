"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const MOBILE_BREAKPOINT = 820;

const ADMIN_EMAIL = "devosmiumbpo@gmail.com";

/* =========================================================
   COMPONENT
========================================================= */

export default function Navbar() {
  const pathname = usePathname();

  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  const {
    user,
    loading,
    signOut,
  } = useAuth();

  /* =======================================================
     MENU STATE
  ======================================================= */

  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  /* =======================================================
     DROPDOWN REFERENCES
  ======================================================= */

  const servicesRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userEmail = user?.email ?? "";

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    userEmail.split("@")[0] ||
    "User";

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const isAdmin =
    userEmail.toLowerCase() ===
    ADMIN_EMAIL.toLowerCase();

  const accountHref = isAdmin
    ? "/admin"
    : "/profile";

  /* =======================================================
     NAVIGATION HELPERS
  ======================================================= */

  const closeMenu = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setWhyOpen(false);
  };

  const closeServices = () => {
    setServicesOpen(false);
  };

  const closeWhy = () => {
    setWhyOpen(false);
  };

  const toggleServices = () => {
    setServicesOpen((current) => !current);
    setWhyOpen(false);
  };

  const toggleWhy = () => {
    setWhyOpen((current) => !current);
    setServicesOpen(false);
  };

  /* =======================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedServices =
        servicesRef.current?.contains(target);

      const clickedWhy =
        whyRef.current?.contains(target);

      if (!clickedServices) {
        setServicesOpen(false);
      }

      if (!clickedWhy) {
        setWhyOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, []);

  /* =======================================================
     RESPONSIVE MENU CONTROL
  ======================================================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setMenuOpen(false);
      }

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        setServicesOpen(false);
        setWhyOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (
      !menuOpen &&
      !servicesOpen &&
      !whyOpen
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setMenuOpen(false);
      setServicesOpen(false);
      setWhyOpen(false);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    menuOpen,
    servicesOpen,
    whyOpen,
  ]);

  /* =======================================================
     ACTIVE NAVIGATION STATES
  ======================================================= */

  const isHomeActive =
    pathname === "/";

  const isServicesActive =
    pathname === "/services";

  const isAboutActive =
    pathname === "/about";

  const isWhyOsmiumActive =
    pathname === "/why-osmium";

  const isCareersActive =
    pathname === "/careers" ||
    pathname.startsWith("/careers/");

  const isContactActive =
    pathname === "/contact";

  /* =======================================================
     MOBILE SERVICE NAVIGATION
  ======================================================= */

  const handleServiceNavigation = () => {
    setServicesOpen(false);
    setWhyOpen(false);
    setMenuOpen(false);
  };

  /* =======================================================
     MOBILE WHY OSMIUM NAVIGATION
  ======================================================= */

  const handleWhyNavigation = () => {
    setWhyOpen(false);
    setServicesOpen(false);
    setMenuOpen(false);
  };

  /* =======================================================
     SIGN OUT
  ======================================================= */

  const handleSignOut = async () => {
    try {
      await signOut();

      closeMenu();
    } catch (error) {
      console.error(
        "[Navbar] Sign out failed:",
        error
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>

        {/* =================================================
            BRAND
        ================================================= */}

        <Link
          href="/"
          className={styles.brand}
          aria-label="Osmium BPO home"
          onClick={closeMenu}
        >
          <img
            src="/brand/osmium-logo.jpg"
            alt="Osmium BPO"
            className={styles.brandLogo}
          />
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className={styles.navLinks}
          aria-label="Main navigation"
        >

          {/* HOME */}

          <Link
            href="/"
            className={
              isHomeActive
                ? styles.active
                : ""
            }
            aria-current={
              isHomeActive
                ? "page"
                : undefined
            }
          >
            Home
          </Link>

          {/* =================================================
              SERVICES
          ================================================= */}

          <div
            ref={servicesRef}
            className={`${styles.servicesMenu} ${
              servicesOpen
                ? styles.servicesMenuOpen
                : ""
            }`}
          >
            <button
              type="button"
              className={`${styles.servicesTrigger} ${
                isServicesActive
                  ? styles.active
                  : ""
              }`}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              onClick={toggleServices}
            >
              <span>
                Services
              </span>

              <span
                className={styles.navChevron}
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <div
              className={styles.servicesDropdown}
              aria-label="Services options"
            >
              <Link
                href="/services"
                className={styles.serviceOption}
                onClick={closeServices}
              >
                <span
                  className={
                    styles.serviceOptionNumber
                  }
                >
                  01
                </span>

                <span
                  className={
                    styles.serviceOptionContent
                  }
                >
                  <strong>
                    Explore Services
                  </strong>

                  <small>
                    View the complete
                    Osmium service
                    catalogue.
                  </small>
                </span>

                <span
                  className={
                    styles.serviceOptionArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>

              <Link
                href="/#services"
                className={styles.serviceOption}
                onClick={closeServices}
              >
                <span
                  className={
                    styles.serviceOptionNumber
                  }
                >
                  02
                </span>

                <span
                  className={
                    styles.serviceOptionContent
                  }
                >
                  <strong>
                    Homepage Preview
                  </strong>

                  <small>
                    See the services
                    section inside
                    the main experience.
                  </small>
                </span>

                <span
                  className={
                    styles.serviceOptionArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>

              <div
                className={
                  styles.servicesDropdownFooter
                }
              >
                <span>
                  PEOPLE × PROCESS × CAPACITY
                </span>

                <span>
                  OSMIUM BPO
                </span>
              </div>
            </div>
          </div>

          {/* ABOUT */}

          <Link
            href="/about"
            className={
              isAboutActive
                ? styles.active
                : ""
            }
            aria-current={
              isAboutActive
                ? "page"
                : undefined
            }
          >
            About Us
          </Link>

          {/* =================================================
              WHY OSMIUM
          ================================================= */}

          <div
            ref={whyRef}
            className={`${styles.servicesMenu} ${
              whyOpen
                ? styles.servicesMenuOpen
                : ""
            }`}
          >
            <button
              type="button"
              className={`${styles.servicesTrigger} ${
                isWhyOsmiumActive
                  ? styles.active
                  : ""
              }`}
              aria-haspopup="true"
              aria-expanded={whyOpen}
              onClick={toggleWhy}
            >
              <span>
                Why Osmium
              </span>

              <span
                className={styles.navChevron}
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <div
              className={styles.servicesDropdown}
              aria-label="Why Osmium options"
            >
              <Link
                href="/why-osmium"
                className={styles.serviceOption}
                onClick={closeWhy}
              >
                <span
                  className={
                    styles.serviceOptionNumber
                  }
                >
                  01
                </span>

                <span
                  className={
                    styles.serviceOptionContent
                  }
                >
                  <strong>
                    Explore Why Osmium
                  </strong>

                  <small>
                    Discover our approach,
                    differentiation and
                    operating philosophy.
                  </small>
                </span>

                <span
                  className={
                    styles.serviceOptionArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>

              <Link
                href="/#why-osmium"
                className={styles.serviceOption}
                onClick={closeWhy}
              >
                <span
                  className={
                    styles.serviceOptionNumber
                  }
                >
                  02
                </span>

                <span
                  className={
                    styles.serviceOptionContent
                  }
                >
                  <strong>
                    Homepage Preview
                  </strong>

                  <small>
                    See why businesses
                    choose Osmium within
                    the main story.
                  </small>
                </span>

                <span
                  className={
                    styles.serviceOptionArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>

              <div
                className={
                  styles.servicesDropdownFooter
                }
              >
                <span>
                  PEOPLE × PROCESS × CAPACITY
                </span>

                <span>
                  OSMIUM BPO
                </span>
              </div>
            </div>
          </div>

          {/* CAREERS */}

          <Link
            href="/careers"
            className={
              isCareersActive
                ? styles.active
                : ""
            }
            aria-current={
              isCareersActive
                ? "page"
                : undefined
            }
          >
            Careers
          </Link>

          {/* CONTACT */}

          <Link
            href="/contact"
            className={
              isContactActive
                ? styles.active
                : ""
            }
            aria-current={
              isContactActive
                ? "page"
                : undefined
            }
          >
            Contact
          </Link>

        </nav>

        {/* =================================================
            DESKTOP ACCOUNT
        ================================================= */}

        {!loading && user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <Link
              href={accountHref}
              aria-label="Open account"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                color: "#ffffff",
                textDecoration: "none",
                padding: "5px 8px",
              }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt=""
                  width={34}
                  height={34}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border:
                      "1px solid rgba(245,181,27,0.65)",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "#f5b51b",
                    color: "#071426",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  {userName
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}

              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.15,
                }}
              >
                <strong
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {userName}
                </strong>

                <small
                  style={{
                    marginTop: "3px",
                    fontSize: "7px",
                    color: "#f5b51b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  {isAdmin
                    ? "Administrator"
                    : "Account"}
                </small>
              </span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                minHeight: "40px",
                padding: "0 12px",
                background: "transparent",
                color:
                  "rgba(255,255,255,0.72)",
                border:
                  "1px solid rgba(255,255,255,0.15)",
                borderRadius: "2px",
                fontFamily: "inherit",
                fontSize: "9px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={styles.navCta}
          >
            <span>
              Sign In
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>
        )}

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          className={`${styles.mobileMenu} ${
            menuOpen
              ? styles.mobileMenuOpen
              : ""
          }`}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <div
        id="mobile-navigation"
        className={`${styles.mobileNav} ${
          menuOpen
            ? styles.mobileNavOpen
            : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className={styles.mobileNavInner}
          aria-label="Mobile navigation"
        >

          {/* HOME */}

          <Link
            href="/"
            className={`${styles.mobileNavLink} ${
              isHomeActive
                ? styles.active
                : ""
            }`}
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <span>
              Home
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>

          {/* =================================================
              MOBILE SERVICES
          ================================================= */}

          <div
            className={`${styles.mobileServices} ${
              servicesOpen
                ? styles.mobileServicesOpen
                : ""
            }`}
          >
            <button
              type="button"
              className={
                styles.mobileServicesTrigger
              }
              aria-expanded={servicesOpen}
              aria-controls="mobile-services-options"
              onClick={toggleServices}
            >
              <span>
                Services
              </span>

              <strong aria-hidden="true">
                ⌄
              </strong>
            </button>

            <div
              id="mobile-services-options"
              className={
                styles.mobileServicesOptions
              }
            >
              <Link
                href="/services"
                className={
                  styles.mobileServiceOption
                }
                tabIndex={
                  menuOpen &&
                  servicesOpen
                    ? 0
                    : -1
                }
                onClick={
                  handleServiceNavigation
                }
              >
                <span>
                  <small>
                    01
                  </small>

                  Explore Services
                </span>

                <strong aria-hidden="true">
                  ↗
                </strong>
              </Link>

              <Link
                href="/#services"
                className={
                  styles.mobileServiceOption
                }
                tabIndex={
                  menuOpen &&
                  servicesOpen
                    ? 0
                    : -1
                }
                onClick={
                  handleServiceNavigation
                }
              >
                <span>
                  <small>
                    02
                  </small>

                  Homepage Preview
                </span>

                <strong aria-hidden="true">
                  ↗
                </strong>
              </Link>
            </div>
          </div>

          {/* ABOUT */}

          <Link
            href="/about"
            className={`${styles.mobileNavLink} ${
              isAboutActive
                ? styles.active
                : ""
            }`}
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <span>
              About Us
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>

          {/* =================================================
              MOBILE WHY OSMIUM
          ================================================= */}

          <div
            className={`${styles.mobileServices} ${
              whyOpen
                ? styles.mobileServicesOpen
                : ""
            }`}
          >
            <button
              type="button"
              className={
                styles.mobileServicesTrigger
              }
              aria-expanded={whyOpen}
              aria-controls="mobile-why-options"
              onClick={toggleWhy}
            >
              <span>
                Why Osmium
              </span>

              <strong aria-hidden="true">
                ⌄
              </strong>
            </button>

            <div
              id="mobile-why-options"
              className={
                styles.mobileServicesOptions
              }
            >
              <Link
                href="/why-osmium"
                className={
                  styles.mobileServiceOption
                }
                tabIndex={
                  menuOpen &&
                  whyOpen
                    ? 0
                    : -1
                }
                onClick={
                  handleWhyNavigation
                }
              >
                <span>
                  <small>
                    01
                  </small>

                  Explore Why Osmium
                </span>

                <strong aria-hidden="true">
                  ↗
                </strong>
              </Link>

              <Link
                href="/#why-osmium"
                className={
                  styles.mobileServiceOption
                }
                tabIndex={
                  menuOpen &&
                  whyOpen
                    ? 0
                    : -1
                }
                onClick={
                  handleWhyNavigation
                }
              >
                <span>
                  <small>
                    02
                  </small>

                  Homepage Preview
                </span>

                <strong aria-hidden="true">
                  ↗
                </strong>
              </Link>
            </div>
          </div>

          {/* CAREERS */}

          <Link
            href="/careers"
            className={`${styles.mobileNavLink} ${
              isCareersActive
                ? styles.active
                : ""
            }`}
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <span>
              Careers
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>

          {/* CONTACT */}

          <Link
            href="/contact"
            className={`${styles.mobileNavLink} ${
              isContactActive
                ? styles.active
                : ""
            }`}
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <span>
              Contact
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>

          {/* =================================================
              MOBILE ACCOUNT
          ================================================= */}

          {!loading && user ? (
            <div
              style={{
                marginTop: "18px",
                paddingTop: "18px",
                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Link
                href={accountHref}
                onClick={closeMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "10px 4px",
                }}
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    width={42}
                    height={42}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border:
                        "1px solid #f5b51b",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#f5b51b",
                      color: "#071426",
                      fontWeight: 800,
                    }}
                  >
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}

                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    {userName}
                  </strong>

                  <small
                    style={{
                      marginTop: "3px",
                      color: "#f5b51b",
                      fontSize: "9px",
                      fontWeight: 700,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {isAdmin
                      ? "Administrator"
                      : "Account"}
                  </small>
                </span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: "100%",
                  minHeight: "48px",
                  marginTop: "8px",
                  background: "transparent",
                  color:
                    "rgba(255,255,255,0.75)",
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={styles.mobileNavCta}
              tabIndex={
                menuOpen ? 0 : -1
              }
              onClick={closeMenu}
            >
              <span>
                Sign In
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </Link>
          )}

          {/* =================================================
              MOBILE CONSULTATION CTA
          ================================================= */}

          {!user && (
            <Link
              href="/contact"
              className={styles.mobileNavCta}
              tabIndex={
                menuOpen ? 0 : -1
              }
              onClick={closeMenu}
              style={{
                marginTop: "10px",
              }}
            >
              <span>
                Request a Consultation
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}