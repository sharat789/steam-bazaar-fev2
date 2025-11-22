"use client";

import Link from "next/link";
import { useAuth } from "../contexts/auth-context";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  console.log("current user", user);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: "#1a1a1a",
        color: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo/Title */}
      <Link
        href="/"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textDecoration: "none",
          color: "white",
          minWidth: "200px",
        }}
      >
        StreamBazaar
      </Link>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        style={{
          flex: 1,
          maxWidth: "500px",
          margin: "0 2rem",
        }}
      >
        <input
          type="text"
          placeholder="Search streams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            border: "none",
            fontSize: "1rem",
          }}
        />
      </form>

      {/* Auth Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          minWidth: "200px",
          justifyContent: "flex-end",
        }}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#2a2a2a",
                border: "none",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#4a4a4a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
              <span style={{ fontSize: "0.8rem" }}>▼</span>
            </button>

            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  right: 0,
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  minWidth: "200px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                }}
              >
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    color: "white",
                    textDecoration: "none",
                    borderBottom: "1px solid #3a3a3a",
                  }}
                >
                  Edit Profile
                </Link>
                <Link
                  href={`/creator/${user.username}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    color: "white",
                    textDecoration: "none",
                    borderBottom: "1px solid #3a3a3a",
                  }}
                >
                  Creator's Corner
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                padding: "0.5rem 1.5rem",
                color: "white",
                textDecoration: "none",
                border: "1px solid white",
                borderRadius: "20px",
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
