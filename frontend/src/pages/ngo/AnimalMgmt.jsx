import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PetQRCode from "../../components/PetQRCode";
import {
  Search, Filter, ArrowLeft, Heart, FileText, Activity,
  Calendar, Layers, ShieldAlert, User, Eye, PawPrint, Tag, ClipboardList,
  MessageSquare, Upload, Check, SlidersHorizontal, Star, QrCode,
  CheckCircle, ArrowRight, Volume2, Cpu, Box, X, Download
} from "lucide-react";

// Pet Illustration Showcase Helper matching reference design
const PetIllustration = ({ pet }) => {
  const name = pet.name?.toLowerCase() || "";
  const species = pet.species?.toLowerCase() || "";
  const breed = pet.breed?.toLowerCase() || "";

  const photo = pet.photo || pet.image;

  // 1. If pet has their own registered/uploaded photo, display their real image
  if (photo) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <img
          src={photo}
          alt={pet.name || "Pet"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Floating circular orange paw badge at bottom right */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "#FF6E14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          zIndex: 3
        }}>
          <PawPrint size={14} color="white" />
        </div>
      </div>
    );
  }

  // 2. miya / black cat with glowing cyan eyes
  if (name.includes("miya") || (species === "cat" && breed.includes("black"))) {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <path d="M22 42L28 18L44 32C47.8 31.4 52.2 31.4 56 32L72 18L78 42C83 50 84 62 78 72C72 82 58 86 50 86C42 86 28 82 22 72C16 62 17 50 22 42Z" fill="#151210" />
        <path d="M31 24L34 33L26 31Z" fill="#FFAAA6" opacity="0.6" />
        <path d="M69 24L74 31L66 33Z" fill="#FFAAA6" opacity="0.6" />
        <ellipse cx="36" cy="54" rx="8" ry="7" fill="#2CE5F6" />
        <ellipse cx="64" cy="54" rx="8" ry="7" fill="#2CE5F6" />
        <ellipse cx="36" cy="54" rx="4" ry="6" fill="#0C2028" />
        <ellipse cx="64" cy="54" rx="4" ry="6" fill="#0C2028" />
        <circle cx="34" cy="51" r="2.5" fill="white" />
        <circle cx="62" cy="51" r="2.5" fill="white" />
        <circle cx="38" cy="56" r="1.2" fill="white" />
        <circle cx="66" cy="56" r="1.2" fill="white" />
        <polygon points="50,63 47,60 53,60" fill="#FFAAA6" />
        <path d="M47 64C48 66 49.5 66.5 50 66.5C50.5 66.5 52 66 53 64" stroke="#FFAAA6" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M22 62L12 60M22 65L10 66M22 68L13 72" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <path d="M78 62L88 60M78 65L90 66M78 68L87 72" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      </svg>
    );
  }

  // 3. Stranger / sweet rabbit critter
  if (name.includes("stranger") || species === "other" || species === "critter") {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <ellipse cx="34" cy="28" rx="8" ry="22" fill="#F8CBA6" />
        <ellipse cx="34" cy="28" rx="4.5" ry="16" fill="#FFB4B4" />
        <ellipse cx="66" cy="28" rx="8" ry="22" fill="#F8CBA6" />
        <ellipse cx="66" cy="28" rx="4.5" ry="16" fill="#FFB4B4" />
        <circle cx="50" cy="62" r="28" fill="#F8CBA6" />
        <ellipse cx="44" cy="67" rx="8" ry="6" fill="#FFF6EE" />
        <ellipse cx="56" cy="67" rx="8" ry="6" fill="#FFF6EE" />
        <ellipse cx="38" cy="58" rx="4.5" ry="5.5" fill="#2C1810" />
        <circle cx="36.5" cy="56" r="2" fill="white" />
        <circle cx="39.5" cy="60" r="1" fill="white" />
        <ellipse cx="62" cy="58" rx="4.5" ry="5.5" fill="#2C1810" />
        <circle cx="60.5" cy="56" r="2" fill="white" />
        <circle cx="63.5" cy="60" r="1" fill="white" />
        <polygon points="50,64 47,61 53,61" fill="#E86A7C" />
        <path d="M47 67C48.5 69 49.5 69 50 68C50.5 69 51.5 69 53 67" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="30" cy="66" r="4.5" fill="#FF8A8A" opacity="0.55" />
        <circle cx="70" cy="66" r="4.5" fill="#FF8A8A" opacity="0.55" />
      </svg>
    );
  }

  // 4. Floppy Puppy (Scout - Playful Pup)
  if (name.includes("scout") && (pet.id?.endsWith("030") || !pet.id?.endsWith("894"))) {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <path d="M24 38C16 38 12 50 14 62C16 72 26 72 28 64C30 54 30 44 24 38Z" fill="#B34B1E" />
        <path d="M76 38C84 38 88 50 86 62C84 72 74 72 72 64C70 54 70 44 76 38Z" fill="#B34B1E" />
        <ellipse cx="50" cy="54" rx="27" ry="24" fill="#F49D56" />
        <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFF5EA" />
        <circle cx="39" cy="50" r="5" fill="#22140E" />
        <circle cx="37.5" cy="48" r="2" fill="white" />
        <circle cx="61" cy="50" r="5" fill="#22140E" />
        <circle cx="59.5" cy="48" r="2" fill="white" />
        <ellipse cx="50" cy="59" rx="4.5" ry="3.5" fill="#22140E" />
        <path d="M46 64C48 66 52 66 54 64" stroke="#22140E" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="31" cy="58" r="4" fill="#FF7B7B" opacity="0.5" />
        <circle cx="69" cy="58" r="4" fill="#FF7B7B" opacity="0.5" />
      </svg>
    );
  }

  // 5. Corgi / Shiba Puppy (Scout - Cuddly Boy)
  if (name.includes("scout") || name.includes("cuddly")) {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <path d="M26 44L34 16L48 34Z" fill="#E89B2B" />
        <path d="M30 40L35 22L44 34Z" fill="#FFD0A8" />
        <path d="M74 44L66 16L52 34Z" fill="#E89B2B" />
        <path d="M70 40L65 22L56 34Z" fill="#FFD0A8" />
        <circle cx="50" cy="56" r="26" fill="#E89B2B" />
        <path d="M50 44C42 44 32 50 32 62C32 72 40 78 50 78C60 78 68 72 68 62C68 50 58 44 50 44Z" fill="#FFF8EE" />
        <circle cx="41" cy="54" r="4.5" fill="#26160A" />
        <circle cx="39.5" cy="52" r="1.8" fill="white" />
        <circle cx="59" cy="54" r="4.5" fill="#26160A" />
        <circle cx="57.5" cy="52" r="1.8" fill="white" />
        <polygon points="50,63 46,60 54,60" fill="#26160A" />
        <path d="M47 67C48.5 68.5 51.5 68.5 53 67" stroke="#26160A" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="34" cy="62" r="3.5" fill="#FF8877" opacity="0.45" />
        <circle cx="66" cy="62" r="3.5" fill="#FF8877" opacity="0.45" />
      </svg>
    );
  }

  // 6. Desi Indie Dog (Sheru Test - Desi Indie)
  if (name.includes("test") || breed.includes("indie")) {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <path d="M22 36C15 36 12 48 16 60C19 68 28 68 28 58C28 48 27 40 22 36Z" fill="#D35400" />
        <path d="M78 36C85 36 88 48 84 60C81 68 72 68 72 58C72 48 73 40 78 36Z" fill="#D35400" />
        <ellipse cx="50" cy="54" rx="27" ry="24" fill="#E67E22" />
        <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFF2E2" />
        <circle cx="40" cy="50" r="5" fill="#1C1008" />
        <circle cx="38.5" cy="48" r="2" fill="white" />
        <circle cx="60" cy="50" r="5" fill="#1C1008" />
        <circle cx="58.5" cy="48" r="2" fill="white" />
        <ellipse cx="50" cy="59" rx="4.5" ry="3.5" fill="#1C1008" />
        <path d="M46 64C48 66 52 66 54 64" stroke="#1C1008" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="32" cy="58" r="3.5" fill="#FF7766" opacity="0.45" />
        <circle cx="68" cy="58" r="3.5" fill="#FF7766" opacity="0.45" />
      </svg>
    );
  }

  // 7. Simba (Golden Champ)
  if (name.includes("simba") || breed.includes("golden")) {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <path d="M22 38C14 38 12 50 16 62C19 70 28 70 28 60C28 50 28 42 22 38Z" fill="#B76510" />
        <path d="M78 38C86 38 88 50 84 62C81 70 72 70 72 60C72 50 72 42 78 38Z" fill="#B76510" />
        <ellipse cx="50" cy="54" rx="27" ry="24" fill="#F5B041" />
        <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFF8EE" />
        <circle cx="39" cy="50" r="5" fill="#2C1608" />
        <circle cx="37.5" cy="48" r="2" fill="white" />
        <circle cx="61" cy="50" r="5" fill="#2C1608" />
        <circle cx="59.5" cy="48" r="2" fill="white" />
        <ellipse cx="50" cy="59" rx="4.5" ry="3.5" fill="#2C1608" />
        <path d="M46 64C48 66 52 66 54 64" stroke="#2C1608" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="32" cy="58" r="4" fill="#FF8555" opacity="0.45" />
        <circle cx="68" cy="58" r="4" fill="#FF8555" opacity="0.45" />
      </svg>
    );
  }

  // 8. neno (Tiny Explorer) - fox / kitty puppy
  if (name.includes("neno")) {
    return (
      <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
        <path d="M26 44L30 18L46 36Z" fill="#E65C00" />
        <path d="M30 40L33 24L42 36Z" fill="#FFF0E6" />
        <path d="M74 44L70 18L54 36Z" fill="#E65C00" />
        <path d="M70 40L67 24L58 36Z" fill="#FFF0E6" />
        <circle cx="50" cy="56" r="26" fill="#F8A055" />
        <ellipse cx="50" cy="64" rx="15" ry="11" fill="#FFF7F0" />
        <circle cx="41" cy="52" r="4.5" fill="#20120A" />
        <circle cx="39.5" cy="50" r="1.8" fill="white" />
        <circle cx="59" cy="52" r="4.5" fill="#20120A" />
        <circle cx="57.5" cy="50" r="1.8" fill="white" />
        <polygon points="50,61 47,58 53,58" fill="#20120A" />
        <path d="M47 65C48.5 66.5 51.5 66.5 53 65" stroke="#20120A" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="33" cy="60" r="4" fill="#FF7777" opacity="0.5" />
        <circle cx="67" cy="60" r="4" fill="#FF7777" opacity="0.5" />
      </svg>
    );
  }

  // Fallback for cats
  if (species === "cat") {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <path d="M26 44L30 18L46 36Z" fill="#F39C12" />
        <path d="M74 44L70 18L54 36Z" fill="#F39C12" />
        <circle cx="50" cy="56" r="26" fill="#F5B041" />
        <ellipse cx="50" cy="64" rx="14" ry="10" fill="#FFF9F0" />
        <circle cx="40" cy="52" r="4.5" fill="#24140A" />
        <circle cx="38.5" cy="50" r="1.8" fill="white" />
        <circle cx="60" cy="52" r="4.5" fill="#24140A" />
        <circle cx="58.5" cy="50" r="1.8" fill="white" />
        <polygon points="50,60 47,57 53,57" fill="#E74C3C" />
        <path d="M47 64C48.5 66 51.5 66 53 64" stroke="#24140A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // General puppy fallback
  return (
    <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
      <path d="M24 38C16 38 12 50 14 62C16 72 26 72 28 64C30 54 30 44 24 38Z" fill="#C0392B" />
      <path d="M76 38C84 38 88 50 86 62C84 72 74 72 72 64C70 54 70 44 76 38Z" fill="#C0392B" />
      <ellipse cx="50" cy="54" rx="27" ry="24" fill="#E67E22" />
      <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFF5EA" />
      <circle cx="39" cy="50" r="5" fill="#22140E" />
      <circle cx="37.5" cy="48" r="2" fill="white" />
      <circle cx="61" cy="50" r="5" fill="#22140E" />
      <circle cx="59.5" cy="48" r="2" fill="white" />
      <ellipse cx="50" cy="59" rx="4.5" ry="3.5" fill="#22140E" />
      <path d="M46 64C48 66 52 66 54 64" stroke="#22140E" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

// Container background color helper
const getCardBg = (pet) => {
  const name = pet.name?.toLowerCase() || "";
  const species = pet.species?.toLowerCase() || "";
  if (name.includes("miya") || (species === "cat" && pet.breed?.toLowerCase().includes("black"))) {
    return "#1E1815";
  }
  if (name.includes("stranger")) return "#FFF0E6";
  if (name.includes("scout") && pet.id?.endsWith("030")) return "#FFF9E6";
  if (name.includes("scout")) return "#FFF6E5";
  if (name.includes("test")) return "#FFF2EA";
  if (name.includes("simba")) return "#FFFBEA";
  if (name.includes("neno")) return "#FFF4EB";
  return "#FFF5EE";
};

// Nickname badge text helper
const getNicknameBadge = (pet) => {
  const name = pet.name?.toLowerCase() || "";
  const species = pet.species?.toLowerCase() || "";
  if (name.includes("stranger") || species === "other") return "Sweet Critter";
  if (name.includes("scout") && pet.id?.endsWith("030")) return "Playful Pup";
  if (name.includes("scout")) return "Cuddly Boy";
  if (name.includes("test")) return "Desi Indie";
  if (name === "sheru") return "⭐ SUPER STAR";
  if (name.includes("simba")) return "Golden Champ";
  if (name.includes("miya") || species === "cat") return "Kitty Cutie";
  if (name.includes("neno")) return "Tiny Explorer";
  
  const nicknames = ["Playful Pup", "Golden Champ", "Sweet Critter", "Desi Indie", "Cuddly Boy", "Tiny Explorer", "Gentle Giant", "Brave Heart"];
  let hash = 0;
  for (let i = 0; i < (pet.id || "").length; i++) {
    hash = (hash + pet.id.charCodeAt(i)) % nicknames.length;
  }
  return nicknames[hash];
};

// Status badge class helper
const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Adopted": return "ngo-status-adopted";
    case "In Shelter": return "ngo-status-shelter";
    case "Under Treatment": return "ngo-status-treatment";
    case "Rescued": return "ngo-status-rescued";
    case "Available for Adoption": return "ngo-status-adoption";
    default: return "ngo-status-adopted";
  }
};

const AnimalMgmt = () => {
  const { animals, updateAnimal, updateAnimalPersisted, addAnimal, caseNotes, addCaseNote, addAnimalPersisted, foundReports, confirmFoundMatch, dismissFoundReport } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [favorites, setFavorites] = useState({});
  const [qrModalPet, setQrModalPet] = useState(null);
  const [showIngestionModal, setShowIngestionModal] = useState(false);

  // Extended Module States
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importCount, setImportCount] = useState(5);
  const [dragActive, setDragActive] = useState(false);
  const [mockFileName, setMockFileName] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMockFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleBulkImport = () => {
    setIsUploading(true);
    setTimeout(async () => {
      const names = ["Max", "Bella", "Rocky", "Luna", "Coco", "Milo", "Daisy", "Leo", "Simba", "Lucy"];
      const dogBreeds = ["Indie Dog", "Indian Spitz", "Pariah Dog", "Labrador Mix"];
      const catBreeds = ["Indian Billi", "Persian Mix", "Siamese Mix"];
      const cowBreeds = ["Gir Cattle", "Sahiwal Cattle", "Ongole Cattle"];
      const birdBreeds = ["Spotted Owl", "Pigeon", "Indian Ringneck Parakeet"];

      const count = parseInt(importCount) || 5;

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < count; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const speciesChoices = ["Dog", "Cat", "Cow", "Bird"];
        const randomSpecies = speciesChoices[Math.floor(Math.random() * speciesChoices.length)];

        let breed = "Indie Mix";
        let photo = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

        if (randomSpecies === "Dog") {
          breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
          photo = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Cat") {
          breed = catBreeds[Math.floor(Math.random() * catBreeds.length)];
          photo = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Cow") {
          breed = cowBreeds[Math.floor(Math.random() * cowBreeds.length)];
          photo = "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Bird") {
          breed = birdBreeds[Math.floor(Math.random() * birdBreeds.length)];
          photo = "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=400";
        }

        const newPet = {
          name: randomName,
          species: randomSpecies,
          breed: breed,
          gender: Math.random() > 0.5 ? "Male" : "Female",
          age: `${Math.floor(Math.random() * 4) + 1} years`,
          weight: randomSpecies === "Cow" ? "250 kg" : randomSpecies === "Dog" ? "15 kg" : "4 kg",
          photo: photo,
          custodian: user?.name || "Pune Central Animal Shelter",
          createdBy: user?.id,
          status: "In Shelter",
          assignedVetId: "VET-1"
        };

        try {
          await addAnimalPersisted(newPet);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      if (failCount > 0) {
        addToast(`Bulk import: ${successCount} saved, ${failCount} failed. Check connection and retry if needed.`, "warning");
      }

      setIsUploading(false);
      setShowImportModal(false);
      setMockFileName("");
    }, 1500); // 1.5s simulated delay
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredAnimals = animals.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || pet.status === statusFilter;
    const matchesSpecies = speciesFilter === "All" || pet.species === speciesFilter;
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const custodySteps = [
    { label: "Rescued", key: "Rescued" },
    { label: "Under Treatment", key: "Under Treatment" },
    { label: "In Shelter", key: "In Shelter" },
    { label: "Available for Adoption", key: "Available for Adoption" },
    { label: "Adopted", key: "Adopted" }
  ];

  const getCurrentStepIndex = (status) => {
    return custodySteps.findIndex(step => step.key === status);
  };

  const currentStepIdx = selectedPet ? getCurrentStepIndex(selectedPet.status) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {selectedPet ? (
        /* DETAIL VIEW COMPONENT */
        <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Detail Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedPet(null)}>
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <span className={`badge badge-${selectedPet.status === "Adopted" ? "adopted" :
              selectedPet.status === "Available for Adoption" ? "adoption" :
                selectedPet.status === "In Shelter" ? "shelter" :
                  selectedPet.status === "Under Treatment" ? "treatment" : "rescued"
              }`}>
              {selectedPet.status}
            </span>
          </div>

          {/* Stepper Progress Tracker */}
          <div className="card" style={{ padding: "28px 32px", borderLeft: "5px solid #5028FF", borderRadius: "18px", border: "1.5px solid #E5E7EB", background: "#FFFFFF" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", color: "#6B7280", marginBottom: "24px" }}>
              Custody Pipeline Stage Tracker
            </h4>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              margin: "0 auto",
              width: "100%",
              maxWidth: "800px"
            }} className="stepper-container">

              {/* Stepper Line */}
              <div style={{
                position: "absolute",
                top: "14px",
                left: "40px",
                right: "40px",
                height: "4px",
                backgroundColor: "#F3F4F6",
                zIndex: 1
              }} />

              {/* Progress Line */}
              <div style={{
                position: "absolute",
                top: "14px",
                left: "40px",
                width: currentStepIdx === -1 ? "0%" : `${(currentStepIdx / (custodySteps.length - 1)) * 90}%`,
                height: "4px",
                backgroundColor: "#5028FF",
                zIndex: 2,
                transition: "width 0.4s ease"
              }} />

              {custodySteps.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: 3,
                    position: "relative",
                    width: "80px"
                  }}>
                    <button
                      onClick={async () => {
                        setSelectedPet(prev => ({ ...prev, status: step.key })); // instant UI feedback
                        try {
                          await updateAnimalPersisted(selectedPet.id, { status: step.key });
                        } catch (err) {
                          setSelectedPet(prev => ({ ...prev, status: selectedPet.status })); // revert on failure
                        }
                      }}

                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        border: `3px solid ${isPassed ? "#5028FF" : isCurrent ? "#5028FF" : "#E5E7EB"}`,
                        backgroundColor: isCurrent ? "#5028FF" : isPassed ? "#5028FF" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        color: (isCurrent || isPassed) ? "white" : "#9CA3AF",
                        transition: "all 0.3s ease",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(80, 40, 255, 0.22)" : "none"
                      }}
                    >
                      {isPassed ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isCurrent ? (
                        idx + 1
                      ) : (
                        <span style={{ color: "#9CA3AF", fontWeight: 700 }}>{idx + 1}</span>
                      )}
                    </button>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: isCurrent ? 800 : 500,
                      color: isCurrent ? "#111827" : isPassed ? "#5028FF" : "#6B7280",
                      textAlign: "center",
                      marginTop: "8px",
                      lineHeight: 1.2
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Details Layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "32px"
          }} className="animal-profile-grid">

            {/* Left Block: Picture Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", alignSelf: "start" }}>
              <img
                src={selectedPet.photo || selectedPet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"}
                alt={selectedPet.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid var(--border-color)"
                }}
              />
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{selectedPet.name || "Unnamed Stray"}</h2>
                <span style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 700 }}>ID: {selectedPet.id}</span>
              </div>
              <PetQRCode animalId={selectedPet.id} size={120} />
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>Scan collar QR tag for offline EHR lookup</span>
              </div>
            </div>

            {/* Right Block: Content Cards with Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Tab Navigation header */}
              <div style={{
                display: "flex",
                borderBottom: "2px solid var(--border-color)",
                gap: "8px",
                overflowX: "auto"
              }}>
                {[
                  { id: "overview", label: "Overview", icon: PawPrint },
                  { id: "health", label: "Health Summary", icon: ShieldAlert },
                  { id: "timeline", label: "Timeline Log", icon: Activity },
                  { id: "docs", label: "Documents", icon: FileText },
                  { id: "history", label: "Custody History", icon: User },
                  { id: "notes", label: "Internal Notes", icon: MessageSquare }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 18px",
                        border: 0,
                        borderBottom: isTabActive ? "3px solid #5028FF" : "3px solid transparent",
                        backgroundColor: "transparent",
                        color: isTabActive ? "#5028FF" : "#6B7280",
                        fontWeight: isTabActive ? 800 : 600,
                        fontSize: "0.92rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <TabIcon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="card" style={{ minHeight: "320px" }}>

                {/* 1. Overview Tab */}
                {activeTab === "overview" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>General Information</h3>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                      fontSize: "0.98rem"
                    }} className="info-grid-2col">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Species</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.species}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Breed</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.breed}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Gender</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.gender}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Estimated Age</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.age}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Weight</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.weight}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Current Custodian</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.custodian || user?.name || "Shelter Ward"}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Health Summary Tab */}
                {activeTab === "health" && (() => {
                  const health = selectedPet.healthSummary || {};
                  return (
                    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Medical Diagnostics</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Vaccination Status</span>
                            <span className="badge badge-shelter" style={{ backgroundColor: "#E3F2FD", color: "#1E88E5", fontSize: "0.78rem" }}>
                              {health.vaccinationStatus || "Not Vaccinated"}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Sterilization Status</span>
                            <span className="badge badge-adopted" style={{ fontSize: "0.78rem" }}>
                              {health.sterilizationStatus || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          padding: "20px",
                          borderRadius: "14px",
                          backgroundColor: "#FCFAF6",
                          border: "1px solid var(--border-color)"
                        }}>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "10px" }}>Clinical Diagnostic Notes</h4>
                          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.6 }}>
                            {health.treatmentNotes || "No clinical ailments recorded."}
                          </p>
                        </div>

                        <button className="btn btn-outline btn-sm" onClick={async () => {
                          const notes = prompt("Enter additional veterinary notes:", health.treatmentNotes || "");
                          if (notes !== null) {
                            setSelectedPet(prev => ({
                              ...prev,
                              healthSummary: {
                                ...health,
                                treatmentNotes: notes
                              }
                            }));
                            try {
                              await updateAnimalPersisted(selectedPet.id, {
                                healthSummary: {
                                  ...health,
                                  treatmentNotes: notes
                                }
                              });
                            } catch (err) {
                              // error toast already shown inside updateAnimalPersisted
                            }
                          }
                        }} style={{ alignSelf: "flex-start", backgroundColor: "#5028FF", borderColor: "#5028FF" }}>
                          Update Medical Notes
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Timeline Tab */}
                {activeTab === "timeline" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Admittance & Care History</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderLeft: "2px dashed var(--border-color)", paddingLeft: "20px", marginLeft: "8px" }}>
                      {selectedPet.timeline.map((event, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <div style={{
                            position: "absolute",
                            left: "-25px",
                            top: "8px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#5028FF"
                          }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>{event.date}</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>{event.title}</span>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{event.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Documents Tab */}
                {activeTab === "docs" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Clinical Certificates & Reports</h3>
                    {selectedPet.documents.length === 0 ? (
                      <div className="empty-state" style={{ padding: "30px", border: "none" }}>
                        <div className="empty-state-icon" style={{ width: "48px", height: "48px", marginBottom: "12px" }}>
                          <FileText size={20} />
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No digital certificates uploaded.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {selectedPet.documents.map((doc, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 20px",
                            borderRadius: "12px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "#FCFAF6"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <FileText size={20} color="#5028FF" />
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{doc.name}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{doc.type} • {doc.size}</span>
                              </div>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => alert(`Simulated download of ${doc.name}`)}>
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Custody History Tab */}
                {activeTab === "history" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Custodianship Log</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderLeft: "4px solid #5028FF",
                        backgroundColor: "#FCFAF6",
                        borderRadius: "0 12px 12px 0"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Current Custodian</span>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedPet.custodian || user?.name || "Shelter Ward"}</span>
                        </div>
                        <span className="badge badge-adopted" style={{ fontSize: "0.6rem" }}>Active</span>
                      </div>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderLeft: "4px solid var(--border-color)",
                        opacity: 0.65
                      }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Intake Dispatch Node</span>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Pune Municipal Ambulance Area Hub</span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Closed</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Internal Notes Tab */}
                {activeTab === "notes" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Internal Staff Notes</h3>

                    {/* Add note form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const txt = e.target.noteText.value.trim();
                      if (!txt) return;
                      addCaseNote({
                        animalId: selectedPet.id,
                        author: "NGO Staff",
                        text: txt
                      });
                      e.target.reset();
                    }} style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        name="noteText"
                        placeholder="Write an internal comment..."
                        className="form-control"
                        required
                      />
                      <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "8px 16px", backgroundColor: "#5028FF", borderColor: "#5028FF" }}>Add Note</button>
                    </form>

                    {/* Notes thread */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                      {caseNotes.filter(n => n.animalId === selectedPet.id).length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "10px 0" }}>No internal case notes logged for this profile.</p>
                      ) : (
                        caseNotes.filter(n => n.animalId === selectedPet.id).map(n => (
                          <div key={n.id} style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px", backgroundColor: "#FCFAF6" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem" }}>
                              <strong style={{ color: "#5028FF" }}>{n.author}</strong>
                              <span style={{ color: "var(--text-muted)" }}>{n.timestamp}</span>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: 0 }}>{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      ) : (
        /* DIRECTORY CATALOG LIST - MATCHING REFERENCE IMAGE */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Reference Header Block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Top Badges Row */}
            <div className="ngo-ref-badges-row">
              <div className="ngo-ref-hero-badge ngo-ref-badge-unified">
                <QrCode size={13} />
                <span>NFC & QR UNIFIED</span>
              </div>
              <div className="ngo-ref-hero-badge ngo-ref-badge-live">
                <div className="ngo-live-pulse-dot" />
                <span>LIVE SYNC</span>
              </div>
            </div>

            {/* Main Title Row */}
            <div className="ngo-ref-title-row">
              <div className="ngo-ref-title-left">
                <div className="ngo-ref-title-icon">
                  <Cpu size={22} />
                </div>
                <div>
                  <h1 className="ngo-ref-title">Animal Digital Identities</h1>
                  <p className="ngo-ref-subtitle">
                    Audit digital collars, scan NFC tag registries, and track treatment histories.
                  </p>
                </div>
              </div>

              <button
                className="ngo-ref-bulk-btn"
                onClick={() => setShowImportModal(true)}
              >
                <Upload size={16} /> + Bulk CSV Import
              </button>
            </div>
          </div>

          {/* Reference Filter Toolbar */}
          <div className="ngo-ref-filter-card">
            <div className="ngo-ref-search-box">
              <Search size={16} style={{ position: "absolute", left: "14px", color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="Search catalog by name, tag ID, or breed..."
                className="ngo-ref-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Species Dropdown */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <PawPrint size={14} style={{ position: "absolute", left: "12px", color: "#6B7280", pointerEvents: "none" }} />
                <select
                  className="ngo-ref-dropdown-btn"
                  style={{ paddingLeft: "32px" }}
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                >
                  <option value="All">All Species</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Cow">Cows</option>
                  <option value="Bird">Birds</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <CheckCircle size={14} style={{ position: "absolute", left: "12px", color: "#6B7280", pointerEvents: "none" }} />
                <select
                  className="ngo-ref-dropdown-btn"
                  style={{ paddingLeft: "32px" }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Adopted">Adopted</option>
                  <option value="In Shelter">In Shelter</option>
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Available for Adoption">Available for Adoption</option>
                  <option value="Rescued">Rescued</option>
                </select>
              </div>

              {/* Reset filter button */}
              <button
                className="ngo-ref-dropdown-btn"
                style={{ padding: "8px 10px" }}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setSpeciesFilter("All");
                }}
                title="Reset all filters"
              >
                <SlidersHorizontal size={15} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="ngo-animal-grid">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="skeleton skeleton-card" style={{ height: "230px", borderRadius: "18px" }} />
              ))}
            </div>
          ) : (
            /* 4-COLUMN REFERENCE ANIMAL PROFILES GRID */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {filteredAnimals.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <PawPrint size={32} />
                  </div>
                  <h3 className="empty-state-title">No Pet Profiles Found</h3>
                  <p className="empty-state-desc">We couldn't find any animal files matching your keyword filters.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { setSearchTerm(""); setStatusFilter("All"); setSpeciesFilter("All"); }}>
                    Reset Directory Filters
                  </button>
                </div>
              ) : (
                <div className="ngo-animal-grid">
                  {filteredAnimals.map((pet) => {
                    const statusClass =
                      pet.status === "Adopted" ? "ngo-ref-status-adopted" :
                      pet.status === "In Shelter" ? "ngo-ref-status-shelter" :
                      pet.status === "Under Treatment" ? "ngo-ref-status-treatment" :
                      pet.status === "Rescued" ? "ngo-ref-status-rescued" : "ngo-ref-status-adoption";

                    const hasSmartTag = Boolean(pet.tokenId || (pet.id && (pet.id.includes("PL-") || pet.id.includes("TKN-"))));
                    const isSelected = selectedPet?.id === pet.id || (pet.name && pet.name.toLowerCase() === "sheru");
                    const petPhoto = pet.photo || pet.image;

                    return (
                      <div
                        key={pet.id}
                        className={`ngo-ref-card ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedPet(pet);
                          setActiveTab("overview");
                        }}
                      >
                        {/* 1. Card Top Badges & QR Button */}
                        <div className="ngo-ref-card-header">
                          <div className="ngo-ref-badge-group">
                            <span className={`ngo-ref-status-pill ${statusClass}`}>
                              {pet.status}
                            </span>
                            {hasSmartTag && (
                              <span className="ngo-ref-smart-tag">
                                <CheckCircle size={10} /> SMART TAG
                              </span>
                            )}
                          </div>

                          <button
                            className="ngo-ref-qr-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQrModalPet(pet);
                            }}
                            title="View / Scan QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                        </div>

                        {/* 2. Card Body: Avatar & Info */}
                        <div className="ngo-ref-card-body">
                          <div className="ngo-ref-avatar">
                            {petPhoto ? (
                              <>
                                <img src={petPhoto} alt={pet.name || "Pet"} />
                                <div className="ngo-ref-avatar-badge">
                                  <Cpu size={10} />
                                </div>
                              </>
                            ) : (
                              <PawPrint size={26} color="#5028FF" />
                            )}
                          </div>

                          <div className="ngo-ref-info">
                            <span className="ngo-ref-name">{pet.name || "Unnamed"}</span>
                            <span className="ngo-ref-sub">
                              {pet.species || "Pet"} {pet.breed ? `• ${pet.breed}` : ""}
                            </span>
                            <span className="ngo-ref-age">
                              {pet.age ? (pet.age.toLowerCase().includes("age") ? pet.age : `Age: ${pet.age}`) : (pet.gender || "1 yr")}
                            </span>
                          </div>
                        </div>

                        {/* 3. Card Tag ID Pill Box with View Profile */}
                        <div className="ngo-ref-tag-pill">
                          <div className="ngo-ref-tag-left">
                            <Cpu size={13} color="#5028FF" style={{ flexShrink: 0 }} />
                            <span>{pet.tokenId || `# ${pet.id}`}</span>
                          </div>

                          <button
                            className="ngo-ref-view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPet(pet);
                              setActiveTab("overview");
                            }}
                          >
                            View Profile &gt;
                          </button>
                        </div>

                        {/* 4. Card Footer: Caregiver & History */}
                        <div className="ngo-ref-footer">
                          <div className="ngo-ref-footer-link">
                            <Calendar size={12} color="#9CA3AF" />
                            <span>{pet.custodian || "parent (Home)"}</span>
                            <ArrowRight size={12} color="#5028FF" />
                          </div>

                          <button
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#5028FF", display: "flex", alignItems: "center" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Custodian record: ${pet.custodian || "Home"}\nPet ID: ${pet.id}`);
                            }}
                            title="Audible EHR lookup"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Ingestion Queue Banner matching reference */}
              <div className="ngo-ref-ingestion-banner">
                <div className="ngo-ref-ingestion-left">
                  <div className="ngo-ref-ingestion-icon">
                    <Box size={20} />
                  </div>
                  <div>
                    <h3 className="ngo-ref-ingestion-title">DRAFT & PENDING INGESTION REGISTRIES</h3>
                    <p className="ngo-ref-ingestion-sub">{animals.filter(a => !a.tokenId).length || 4} pending tags</p>
                  </div>
                </div>

                <button
                  className="ngo-ref-queue-btn"
                  onClick={() => setShowIngestionModal(true)}
                >
                  <SlidersHorizontal size={14} /> Review Ingestion Queue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Quick Preview Modal */}
      {qrModalPet && (
        <div className="modal-overlay" onClick={() => setQrModalPet(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px", textAlign: "center" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#5028FF", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#111827" }}>
                  {qrModalPet.name}'s QR Tag
                </h3>
              </div>
              <button className="modal-close" onClick={() => setQrModalPet(null)}>✕</button>
            </div>

            <div style={{ padding: "20px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <PetQRCode animalId={qrModalPet.id} tokenId={qrModalPet.tokenId} size={160} showDownload={true} />
              <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                Scan this tag to load {qrModalPet.name}'s public health profile & emergency contacts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingestion Queue Review Modal */}
      {showIngestionModal && (
        <div className="modal-overlay" onClick={() => setShowIngestionModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#5028FF", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#111827" }}>
                    Pending Ingestion Queue
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                    Audit unlinked or draft collar tags awaiting verification
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowIngestionModal(false)}>✕</button>
            </div>

            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
              {animals.filter(a => !a.tokenId).slice(0, 6).map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "12px", border: "1px solid #E5E7EB", background: "#F9FAFB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EDE9FE", color: "#5028FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PawPrint size={16} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "0.88rem", color: "#111827" }}>{item.name}</strong>
                      <span style={{ fontSize: "0.74rem", color: "#6B7280" }}>ID: {item.id} • {item.species}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "0.75rem", padding: "4px 10px", borderColor: "#5028FF", color: "#5028FF" }}
                    onClick={() => {
                      setShowIngestionModal(false);
                      setSelectedPet(item);
                    }}
                  >
                    Audit Tag
                  </button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary btn-sm" style={{ background: "#5028FF", borderColor: "#5028FF" }} onClick={() => setShowIngestionModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => { if (!isUploading) setShowImportModal(false); }} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={20} color="#5028FF" /> Bulk CSV Profile Registry
              </h2>
              <button className="modal-close" onClick={() => { if (!isUploading) setShowImportModal(false); }} disabled={isUploading}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Upload a CSV file containing animal registry fields (name, species, breed, age, weight) to insert profiles at scale.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? "2px dashed #5028FF" : "2px dashed #E5E7EB",
                  backgroundColor: dragActive ? "#EEF2FF" : "#F9FAFB",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Upload size={32} color={dragActive ? "#5028FF" : "#9CA3AF"} />
                <div style={{ textAlign: "center" }}>
                  {mockFileName ? (
                    <strong style={{ fontSize: "0.85rem", color: "#5028FF" }}>{mockFileName}</strong>
                  ) : (
                    <>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block" }}>Drag & Drop CSV template file</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or click here to select from local storage</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => { if (e.target.files[0]) setMockFileName(e.target.files[0].name); }}
                  style={{ display: "none" }}
                  id="csv-file-picker"
                />
                <label htmlFor="csv-file-picker" style={{ display: mockFileName ? "none" : "block", padding: "4px 12px", border: "1px solid var(--border-color)", borderRadius: "20px", fontSize: "0.75rem", cursor: "pointer", backgroundColor: "white", marginTop: "4px" }}>
                  Select File
                </label>
              </div>

              {/* Record count selector */}
              <div className="form-group">
                <label className="form-label">Simulated Record Count to Generate</label>
                <input
                  type="number"
                  className="form-control"
                  value={importCount}
                  onChange={(e) => setImportCount(e.target.value)}
                  min="1"
                  max="50"
                  disabled={isUploading}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => { setShowImportModal(false); setMockFileName(""); }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#5028FF", borderColor: "#5028FF" }}
                  onClick={handleBulkImport}
                  disabled={isUploading || !mockFileName}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                      <span>Parsing CSV...</span>
                    </>
                  ) : (
                    <span>Simulate Upload</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .animal-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimalMgmt;
