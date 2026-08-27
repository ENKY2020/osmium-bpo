"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        "Unable to sign in with Google. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* Background effects */}
      <div
        className={styles.grid}
        aria-hidden="true"
      />

      <div
        className={styles.backgroundGlow}
        aria-hidden="true"
      />

      <div
        className={styles.backgroundGlowTwo}
        aria-hidden="true"
      />

      <div className={styles.container}>

        {/* =================================================
            LEFT — OSMIUM BRAND
        ================================================= */}

        <section className={styles.brandSide}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <span />
            </div>

            <div className={styles.logoText}>
              <span className={styles.logoName}>
                OSMIUM{" "}
                <span className={styles.logoAccent}>
                  BPO
                </span>
              </span>

              <span className={styles.logoTagline}>
                CALL. DELEGATE. OUTSOURCE. AUTOMATE.
              </span>
            </div>
          </div>

          <div className={styles.eyebrow}>
            Secure Business Access
          </div>

          <h1 className={styles.heading}>
            The work behind
            <br />

            <span className={styles.headingAccent}>
              your business.
            </span>
          </h1>

          <p className={styles.description}>
            Access your Osmium workspace, manage
            business operations, and connect with the
            systems that keep your organisation moving.
          </p>

          <p className={styles.footerText}>
            People. Processes. Performance.
          </p>
        </section>


        {/* =================================================
            RIGHT — LOGIN CARD
        ================================================= */}

        <section className={styles.cardWrapper}>
          <div className={styles.card}>

            <div className={styles.cardEyebrow}>
              OSMIUM BPO
            </div>

            <h2 className={styles.cardTitle}>
              Welcome back.
            </h2>

            <p className={styles.cardDescription}>
              Sign in securely using your Google
              account to access your Osmium workspace.
            </p>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg
                className={styles.googleIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.54 13.68A5.85 5.85 0 0 1 6.23 12c0-.58.1-1.15.31-1.68V7.79H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.21l3.24-2.53Z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.29c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.01 9.46 6.29 12 6.29Z"
                />
              </svg>

              <span>
                {loading
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </span>
            </button>

            {error && (
              <p className={styles.error}>
                {error}
              </p>
            )}

            <div className={styles.divider}>
              <span>SECURE ACCESS</span>
            </div>

            <div className={styles.security}>
              <span
                className={styles.securityDot}
              />

              <span>
                Your account is securely
                authenticated through Google
                and Supabase.
              </span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}