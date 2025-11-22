"use client";
import { useAuth } from "@/src/contexts/auth-context";
import { AuthService } from "@/src/services/auth.service";
import { useState } from "react";
import Modal from "@/src/components/modal";
import { FormField, FormButtons } from "@/src/components/form";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const openEditModal = () => {
    setEditProfileModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;

    const updatedProfile: {
      username?: string;
      email?: string;
      password?: string;
    } = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
    };

    // Only include password if it's provided
    if (password) {
      updatedProfile.password = password;
    }

    try {
      const response = await AuthService.update(updatedProfile);
      if (response.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          setEditProfileModal(false);
          window.location.reload(); // Refresh to get updated user data
        }, 1500);
      } else {
        setError(
          response.error?.message ||
            "Failed to update profile. Please try again."
        );
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          border: "1px solid #2a2a2a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#ffffff" }}>
            Profile
          </h1>
          <button
            onClick={openEditModal}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              color: "white",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
            }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.5rem",
                color: "#ffffff",
              }}
            >
              {user.username}
            </h2>
            <p style={{ margin: 0, color: "#9ca3af" }}>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              border: "1px solid #3a3a3a",
            }}
          >
            <p
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.875rem",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              Username
            </p>
            <p style={{ margin: 0, fontSize: "1.125rem", color: "#ffffff" }}>
              {user.username}
            </p>
          </div>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              border: "1px solid #3a3a3a",
            }}
          >
            <p
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.875rem",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              Email
            </p>
            <p style={{ margin: 0, fontSize: "1.125rem", color: "#ffffff" }}>
              {user.email}
            </p>
          </div>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              border: "1px solid #3a3a3a",
            }}
          >
            <p
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.875rem",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              Role
            </p>
            <p style={{ margin: 0, fontSize: "1.125rem", color: "#ffffff" }}>
              {user.role || "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editProfileModal}
        onClose={() => !isSubmitting && setEditProfileModal(false)}
        title="Edit Profile"
        size="md"
      >
        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#d1fae5",
              color: "#065f46",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            {success}
          </div>
        )}
        <form onSubmit={handleEditProfile}>
          <FormField
            label="Username"
            name="username"
            type="text"
            required
            defaultValue={user.username}
            placeholder="Enter your username"
          />
          <FormField
            label="Email"
            name="email"
            type="text"
            required
            defaultValue={user.email}
            placeholder="Enter your email"
          />
          <FormField
            label="New Password"
            name="password"
            type="text"
            placeholder="Leave blank to keep current password"
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              marginTop: "-0.5rem",
              marginBottom: "1rem",
            }}
          >
            Only fill this if you want to change your password
          </p>
          <FormButtons
            onCancel={() => setEditProfileModal(false)}
            submitText="Update Profile"
            isSubmitting={isSubmitting}
          />
        </form>
      </Modal>
    </div>
  );
}
