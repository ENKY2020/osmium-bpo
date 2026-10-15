"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";

/* =========================================================
   OSMIUM BPO — NAVBAR
   Production navigation component
========================================================= */

/* =========================================================
   CONFIGURATION
========================================================= */

const MOBILE_BREAKPOINT = 820;

/*
 * Temporary administrator recognition.
 *
 * This remains intentionally simple for the current
 * deliverable. It can later be moved into a proper
 * authorization / role system when the admin system
 * is expanded.
 */
const ADMIN_EMAILS = [
  "devosmiumbpo@gmail.com",
  "jeffnjubi@gmail.com",
];
/*
 * The full account/profile area is not part of the
 * current lightweight deliverable.
 *
 * Normal authenticated users therefore use the home
 * page as a safe fallback instead of being sent to
 * a route that does not exist yet.
 */
const USER_ACCOUNT_FALLBACK = "/";

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

  const servicesRef =
    useRef<HTMLDivElement>(null);

  const whyRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userEmail =
    user?.email?.trim() ?? "";

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    (userEmail
      ? userEmail.split("@")[0]
      : "") ||
    "User";

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  

const normalizedEmail = userEmail.toLowerCase();


const isAdmin = ADMIN_EMAILS.some(
  (adminEmail) =>
    adminEmail.trim().toLowerCase() === normalizedEmail
);

  /*
   * Admin users go to the existing admin dashboard.
   *
   * Normal users use the safe fallback until the
   * dedicated account page is implemented.
   */
  const accountHref = isAdmin
    ? "/admin"
    : USER_ACCOUNT_FALLBACK;

  /* =======================================================
     ACTIVE NAVIGATION
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
     MENU HELPERS
  ======================================================= */

  const closeAllMenus = () => {
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
    setServicesOpen(
      (current) => !current
    );

    setWhyOpen(false);
  };

  const toggleWhy = () => {
    setWhyOpen(
      (current) => !current
    );

    setServicesOpen(false);
  };

  /* =======================================================
     MOBILE NAVIGATION HELPERS
  ======================================================= */

  const handleMobileLinkClick = () => {
    closeAllMenus();
  };

  const handleMobileServicesLinkClick = () => {
    closeAllMenus();
  };

  const handleMobileWhyLinkClick = () => {
    closeAllMenus();
  };

  /* =======================================================
     SIGN OUT
  ======================================================= */

  const handleSignOut = async () => {
    try {
      await signOut();
      closeAllMenus();
    } catch (error) {
      console.error(
        "[Navbar] Sign out failed:",
        error
      );
    }
  };

  /* =======================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      const clickedServices =
        servicesRef.current?.contains(
          target
        );

      const clickedWhy =
        whyRef.current?.contains(
          target
        );

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
     CLOSE MENUS WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  /* =======================================================
     RESPONSIVE MENU SAFETY
  ======================================================= */

  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth >
        MOBILE_BREAKPOINT
      ) {
        setMenuOpen(false);
      }

      if (
        window.innerWidth <=
        MOBILE_BREAKPOINT
      ) {
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

      closeAllMenus();
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
     USER DISPLAY HELPERS
  ======================================================= */

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase() || "U";

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
          onClick={
            handleMobileLinkClick
          }
        >
          <Image
            src="/brand/osmium-logo.jpg"
            alt="Osmium BPO"
            width={175}
            height={64}
            className={styles.brandLogo}
            priority
          />
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className={styles.navLinks}
          aria-label="Main navigation"
        >

          {/* =================================================
              HOME
          ================================================= */}

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
              aria-expanded={
                servicesOpen
              }
              onClick={
                toggleServices
              }
            >
              <span>
                Services
              </span>

              <span
                className={
                  styles.navChevron
                }
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <div
              className={
                styles.servicesDropdown
              }
              aria-label="Services options"
            >
              <Link
                href="/services"
                className={
                  styles.serviceOption
                }
                onClick={
                  closeServices
                }
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
                className={
                  styles.serviceOption
                }
                onClick={
                  closeServices
                }
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

          {/* =================================================
              ABOUT
          ================================================= */}

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
                className={
                  styles.navChevron
                }
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <div
              className={
                styles.servicesDropdown
              }
              aria-label="Why Osmium options"
            >
              <Link
                href="/why-osmium"
                className={
                  styles.serviceOption
                }
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
                className={
                  styles.serviceOption
                }
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

          {/* =================================================
              CAREERS
          ================================================= */}

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

          {/* =================================================
              CONTACT
          ================================================= */}

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
            DESKTOP ACCOUNT / SIGN IN
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
              aria-label={
                isAdmin
                  ? "Open administrator dashboard"
                  : "Open account"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                color: "#ffffff",
                textDecoration: "none",
                padding: "5px 8px",
                borderRadius: "3px",
              }}
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt=""
                  width={34}
                  height={34}
                  unoptimized
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
                  aria-hidden="true"
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
                  {userInitial}
                </span>
              )}

              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.15,
                  minWidth: 0,
                }}
              >
                <strong
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                  }}
                >
                  {userName}
                </strong>

                <small
                  style={{
                    marginTop: "3px",
                    fontSize: "7px",
                    color: "#f5b51b",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.08em",
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
                background:
                  "transparent",
                color:
                  "rgba(255,255,255,0.72)",
                border:
                  "1px solid rgba(255,255,255,0.15)",
                borderRadius: "2px",
                fontFamily: "inherit",
                fontSize: "9px",
                fontWeight: 700,
                cursor: "pointer",
                transition:
                  "border-color 180ms ease, color 180ms ease",
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
          onClick={() => {
            setMenuOpen(
              (current) => !current
            );
            setServicesOpen(false);
            setWhyOpen(false);
          }}
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

          {/* =================================================
              HOME
          ================================================= */}

          <Link
            href="/"
            className={`${styles.mobileNavLink} ${
              isHomeActive
                ? styles.active
                : ""
            }`}
            tabIndex={
              menuOpen ? 0 : -1
            }
            onClick={
              handleMobileLinkClick
            }
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
              aria-expanded={
                servicesOpen
              }
              aria-controls="mobile-services-options"
              onClick={
                toggleServices
              }
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
                  handleMobileServicesLinkClick
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
                  handleMobileServicesLinkClick
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

          {/* =================================================
              ABOUT
          ================================================= */}

          <Link
            href="/about"
            className={`${styles.mobileNavLink} ${
              isAboutActive
                ? styles.active
                : ""
            }`}
            tabIndex={
              menuOpen ? 0 : -1
            }
            onClick={
              handleMobileLinkClick
            }
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
                  handleMobileWhyLinkClick
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
                  handleMobileWhyLinkClick
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

          {/* =================================================
              CAREERS
          ================================================= */}

          <Link
            href="/careers"
            className={`${styles.mobileNavLink} ${
              isCareersActive
                ? styles.active
                : ""
            }`}
            tabIndex={
              menuOpen ? 0 : -1
            }
            onClick={
              handleMobileLinkClick
            }
          >
            <span>
              Careers
            </span>

            <strong aria-hidden="true">
              ↗
            </strong>
          </Link>

          {/* =================================================
              CONTACT
          ================================================= */}

          <Link
            href="/contact"
            className={`${styles.mobileNavLink} ${
              isContactActive
                ? styles.active
                : ""
            }`}
            tabIndex={
              menuOpen ? 0 : -1
            }
            onClick={
              handleMobileLinkClick
            }
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
                onClick={
                  handleMobileLinkClick
                }
                aria-label={
                  isAdmin
                    ? "Open administrator dashboard"
                    : "Open account"
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "10px 4px",
                  borderRadius: "3px",
                }}
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt=""
                    width={42}
                    height={42}
                    unoptimized
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
                    aria-hidden="true"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#f5b51b",
                      color: "#071426",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    {userInitial}
                  </span>
                )}

                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "220px",
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
                      letterSpacing:
                        "0.08em",
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
                  background:
                    "transparent",
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
              className={
                styles.mobileNavCta
              }
              tabIndex={
                menuOpen ? 0 : -1
              }
              onClick={
                handleMobileLinkClick
              }
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
              className={
                styles.mobileNavCta
              }
              tabIndex={
                menuOpen ? 0 : -1
              }
              onClick={
                handleMobileLinkClick
              }
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