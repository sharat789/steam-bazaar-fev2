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
      <h1 style={{ marginBottom: "2rem" }}>Creator's Corner</h1>
      <p style={{ marginBottom: "3rem", color: "#666" }}>
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
            color: "black",
            padding: "2rem",
            backgroundColor: "#7cc704ff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h2 style={{ marginBottom: "0.5rem" }}>Products</h2>
          <p style={{ color: "#000000ff" }}>
            Manage your product catalog, pricing, and inventory
          </p>
        </Link>

        {/* Sessions Card */}
        <Link
          href={`/creator/${username}/sessions`}
          style={{
            textDecoration: "none",
            color: "black",
            padding: "2rem",
            backgroundColor: "#08529bff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎥</div>
          <h2 style={{ marginBottom: "0.5rem" }}>Live Sessions</h2>
          <p style={{ color: "#000000ff" }}>
            View your streaming history and session analytics
          </p>
        </Link>
        {/* Analytics Card */}
        <Link
          href={`/creator/${username}/analytics`}
          style={{
            textDecoration: "none",
            color: "black",
            padding: "2rem",
            backgroundColor: "#b1416fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h2 style={{ marginBottom: "0.5rem" }}>Analytics</h2>
          <p style={{ color: "#000000ff" }}>
            Track views, engagement, and revenue metrics
          </p>
        </Link>
      </div>

      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          backgroundColor: "#07b5beff",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ color: "#000000ff", marginBottom: "1rem" }}>
          Quick Stats
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                color: "#000000ff",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              0
            </p>
            <p style={{ color: "#000000ff", margin: 0 }}>Total Products</p>
          </div>
          <div>
            <p
              style={{
                color: "#000000ff",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              0
            </p>
            <p style={{ color: "#000000ff", margin: 0 }}>Live Sessions</p>
          </div>
          <div>
            <p
              style={{
                color: "#000000ff",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              0
            </p>
            <p style={{ color: "#000000ff", margin: 0 }}>Total Views</p>
          </div>
        </div>
      </div>
    </div>
  );
}
