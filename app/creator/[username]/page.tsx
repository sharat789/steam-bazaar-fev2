"use client";

import { useAuth } from "@/src/contexts/auth-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function CreatorsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const username = params.username as string;

  useEffect(() => {
    // Redirect if not authenticated or trying to access another user's page
    if (!isLoading && (!isAuthenticated || user?.username !== username)) {
      router.push("/");
    }
  }, [user, isAuthenticated, isLoading, username, router]);

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.username !== username) {
    return null;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", color: "#ffffff" }}>
        Creator's Corner
      </h1>
      <p style={{ marginBottom: "3rem", color: "#9ca3af" }}>
        Welcome back, {user.username}! Manage your content and grow your
        audience.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Products Card */}
        <Link
          href={`/creator/${username}/products`}
          style={{
            textDecoration: "none",
            color: "#ffffff",
            padding: "2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
            borderLeft: "4px solid #10b981",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h2 style={{ marginBottom: "0.5rem", color: "#ffffff" }}>Products</h2>
          <p style={{ color: "#9ca3af" }}>
            Manage your product catalog, pricing, and inventory
          </p>
        </Link>

        {/* Sessions Card */}
        <Link
          href={`/creator/${username}/sessions`}
          style={{
            textDecoration: "none",
            color: "#ffffff",
            padding: "2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
            borderLeft: "4px solid #3b82f6",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎥</div>
          <h2 style={{ marginBottom: "0.5rem", color: "#ffffff" }}>
            Live Sessions
          </h2>
          <p style={{ color: "#9ca3af" }}>
            View your streaming history and session analytics
          </p>
        </Link>
        {/* Analytics Card */}
        <Link
          href={`/creator/${username}/analytics`}
          style={{
            textDecoration: "none",
            color: "#ffffff",
            padding: "2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
            borderLeft: "4px solid #8b5cf6",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h2 style={{ marginBottom: "0.5rem", color: "#ffffff" }}>
            Analytics
          </h2>
          <p style={{ color: "#9ca3af" }}>
            Track views, engagement, and revenue metrics
          </p>
        </Link>
      </div>
    </div>
  );
}
