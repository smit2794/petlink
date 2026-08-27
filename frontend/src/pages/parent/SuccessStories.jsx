import React, { useState, useEffect } from "react";
import { Quote, Heart, Star } from "lucide-react";

const SuccessStories = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const stories = [
    {
      id: "ST-01",
      petName: "Sheru",
      tagId: "PET-101",
      parentName: "Mehul Kulkarni",
      photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
      quote: "Sheru was rescued with a severe leg fracture. Seeing him sprint across the park today, it feels like a miracle. PetLink made the adoption process so transparent and seamless!",
      daysSinceAdoption: 120
    },
    {
      id: "ST-02",
      petName: "Mani",
      tagId: "PET-103",
      parentName: "Rohan Deshmukh",
      photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
      quote: "Mani was a shy stray cat rescued from Kothrud area. She has now claimed the sunny spot on our living room couch and purrs every time she hears a food bowl. Absolute absolute sweetheart.",
      daysSinceAdoption: 85
    },
    {
      id: "ST-03",
      petName: "Cheeku",
      tagId: "PET-105",
      parentName: "Ananya Godbole",
      photo: "https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=600",
      quote: "Adopting Cheeku has brought our family so much closer. His energy is infectious and knowing his digital health registry is backed by real clinic logs gives us ultimate peace of mind.",
      daysSinceAdoption: 210
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Success Stories & Happy Tails
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Explore community diaries of street animals who transitioned from clinical recovery into forever homes.
        </p>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "380px", borderRadius: "20px" }} />
          ))}
        </div>
      ) : (
        /* Stories Grid */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "28px"
        }} className="animate-fade-in">
          {stories.map((story) => (
            <div
              key={story.id}
              className="card animate-slide-up"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-color)"
              }}
            >
              {/* Photo */}
              <div style={{ position: "relative", height: "200px" }}>
                <img
                  src={story.photo}
                  alt={story.petName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span className="badge badge-adopted" style={{ position: "absolute", bottom: "16px", left: "16px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Heart size={10} fill="white" /> {story.daysSinceAdoption} Days Together
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    {story.petName}
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 500 }}>({story.tagId})</span>
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                    Adopted by: {story.parentName}
                  </span>
                </div>

                {/* Quote block */}
                <div style={{
                  position: "relative",
                  backgroundColor: "#FCFAF6",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--accent-amber)",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.6,
                  flex: 1
                }}>
                  <Quote size={20} color="var(--accent-amber)" style={{ opacity: 0.15, position: "absolute", top: "8px", right: "8px" }} />
                  "{story.quote}"
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "14px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-amber)", fontWeight: 700 }}>
                    <Star size={12} fill="var(--accent-amber)" /> Verifiable Adoption
                  </span>
                  <span>Credential Hash: {story.id}A</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SuccessStories;
