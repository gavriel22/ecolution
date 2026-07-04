"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/lib/api-client";

export default function CreateActivityPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activityDate, setActivityDate] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      
      // format date to ISO 8601 if provided, otherwise use current date
      const isoDate = activityDate ? new Date(activityDate).toISOString() : new Date().toISOString();
      formData.append("activityDate", isoDate);
      
      if (location) {
        formData.append("location", location);
      }
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await fetchClient("/api/activity", {
        method: "POST",
        body: formData,
      });
      router.push("/activities");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error creating activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Activity</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300 }}>
        <input 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <input 
          placeholder="Category ID (UUID)" 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)} 
          required 
        />
        <input 
          type="datetime-local"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          required
        />
        <input 
          placeholder="Location (Optional)" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
        />
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }} 
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
