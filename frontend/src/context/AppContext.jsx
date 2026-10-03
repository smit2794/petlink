import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import client from "../api/client";
import { useAuth } from "./AuthContext";
import {
  initialAnimals,
  initialRescues,
  initialVolunteers,
  initialDonations,
  initialAdoptions,
  initialInventory,
  initialComplaints
} from "../data/mockData";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [animals, setAnimals] = useState(initialAnimals);

  const fetchAnimals = async () => {
    try {
      const res = await client.get("/animals");
      setAnimals(res.data);
    } catch (err) {
      console.error("Failed to load animals from backend:", err.message);
    } finally {
      setAnimalsLoaded(true);
    }
  };

  // Re-fetch role-scoped animals on login, logout, or account switch
  useEffect(() => {
    fetchAnimals();
  }, [token, user?.id]);

  useEffect(() => {
    client.get("/donations")
      .then((res) => {
        const backendDonations = res.data;
        setDonations((prevDonations) => {
          const existingIds = new Set(prevDonations.map((d) => d.id));
          const newOnes = backendDonations.filter((d) => !existingIds.has(d.id));
          return [...newOnes, ...prevDonations];
        });
      })
      .catch((err) => {
        console.error("Failed to load donations from backend:", err.message);
      });
  }, []);

  useEffect(() => {
    client.get("/rescues")
      .then((res) => {
        const backendRescues = res.data;
        setRescues((prevRescues) => {
          const existingIds = new Set(prevRescues.map((r) => r.id));
          const newOnes = backendRescues.filter((r) => !existingIds.has(r.id));
          return [...newOnes, ...prevRescues];
        });
      })
      .catch((err) => {
        console.error("Failed to load rescues from backend:", err.message);
      });
  }, []);

  useEffect(() => {
    client.get("/volunteers")
      .then((res) => {
        const backendVolunteers = res.data;
        setVolunteers((prevVolunteers) => {
          const existingIds = new Set(prevVolunteers.map((v) => v.id));
          const newOnes = backendVolunteers.filter((v) => !existingIds.has(v.id));
          return [...newOnes, ...prevVolunteers];
        });
      })
      .catch((err) => {
        console.error("Failed to load volunteers from backend:", err.message);
      });
  }, []);

  useEffect(() => {
    client.get("/inventory")
      .then((res) => {
        const backendInventory = res.data;
        setInventory((prevInventory) => {
          const existingIds = new Set(prevInventory.map((i) => i.id));
          const newOnes = backendInventory.filter((i) => !existingIds.has(i.id));
          return [...newOnes, ...prevInventory];
        });
      })
      .catch((err) => {
        console.error("Failed to load inventory from backend:", err.message);
      });
  }, []);

  useEffect(() => {
    client.get("/scanlogs")
      .then((res) => {
        const backendLogs = res.data;
        setScanLogs((prevLogs) => {
          const existingIds = new Set(prevLogs.map((l) => l.id));
          const newOnes = backendLogs.filter((l) => !existingIds.has(l.id));
          return [...newOnes, ...prevLogs];
        });
      })
      .catch((err) => console.error("Failed to load scan logs from backend:", err.message));
  }, []);

  useEffect(() => {
    client.get("/foundreports")
      .then((res) => {
        const backendReports = res.data;
        setFoundReports((prevReports) => {
          const existingIds = new Set(prevReports.map((r) => r.id));
          const newOnes = backendReports.filter((r) => !existingIds.has(r.id));
          return [...newOnes, ...prevReports];
        });
      })
      .catch((err) => console.error("Failed to load found reports from backend:", err.message));
  }, []);

  useEffect(() => {
    client.get("/vetinventory")
      .then((res) => {
        const backendItems = res.data;
        setVetInventory((prevItems) => {
          const existingIds = new Set(prevItems.map((i) => i.id));
          const newOnes = backendItems.filter((i) => !existingIds.has(i.id));
          return [...newOnes, ...prevItems];
        });
      })
      .catch((err) => console.error("Failed to load vet inventory from backend:", err.message));
  }, []);

  const [rescues, setRescues] = useState(initialRescues);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [donations, setDonations] = useState(initialDonations);
  const [adoptions, setAdoptions] = useState(initialAdoptions);
  const persistedAdoptionIds = useRef(new Set());
  const [inventory, setInventory] = useState(initialInventory);
  const [toasts, setToasts] = useState([]);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);

  useEffect(() => {
    client.get("/adoptions")
      .then(async (res) => {
        const backendAdoptions = Array.isArray(res.data) ? res.data : [];
        backendAdoptions.forEach((a) => persistedAdoptionIds.current.add(a.id));

        // Auto-seed missing initial mock adoptions into MongoDB Atlas if not present
        const missingInitial = initialAdoptions.filter((initApp) => !persistedAdoptionIds.current.has(initApp.id));
        if (missingInitial.length > 0) {
          for (const appToSeed of missingInitial) {
            try {
              const seedRes = await client.post('/adoptions', appToSeed);
              backendAdoptions.push(seedRes.data);
              persistedAdoptionIds.current.add(seedRes.data.id);
            } catch (seedErr) {
              // Ignore duplicate or network error silently
            }
          }
        }

        setAdoptions((prevAdoptions) => {
          const combined = [...backendAdoptions];
          const combinedIds = new Set(combined.map((a) => a.id));
          prevAdoptions.forEach((p) => {
            if (!combinedIds.has(p.id)) combined.push(p);
          });
          return combined;
        });
      })
      .catch((err) => {
        console.error("Failed to load adoptions from backend:", err.message);
      });
  }, []);

  // Vet Portal State Setup
  const [vetInventory, setVetInventory] = useState(() => {
    const saved = localStorage.getItem("petlink_vet_inventory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing cached vet inventory:", e);
      }
    }
    return [
      { id: "VMD-1790320333915-667", name: "X", stock: 10, unit: "Vials", threshold: 10, expiryDate: "2026-09-25" },
      { id: "VMD-101", name: "Rabies Vaccine (Rabigen)", stock: 45, unit: "Vials", threshold: 15, expiryDate: "2027-02-14" },
      { id: "VMD-102", name: "Feline Triple Vaccine (Feligen)", stock: 8, unit: "Vials", threshold: 10, expiryDate: "2026-11-20" },
      { id: "VMD-103", name: "Meloxicam Painkiller (Suspension)", stock: 12, unit: "Bottles", threshold: 5, expiryDate: "2027-06-05" },
      { id: "VMD-104", name: "Enrofloxacin Antibiotics (50mg)", stock: 120, unit: "Tablets", threshold: 50, expiryDate: "2028-01-10" },
      { id: "VMD-105", name: "Sterile Gauze Rolls & Bandages", stock: 65, unit: "Packs", threshold: 20, expiryDate: "2029-05-30" }
    ];
  });

  useEffect(() => {
    if (vetInventory && vetInventory.length > 0) {
      localStorage.setItem("petlink_vet_inventory", JSON.stringify(vetInventory));
    }
  }, [vetInventory]);

  const [vetAppointments, setVetAppointments] = useState(() => {
    const saved = localStorage.getItem("petlink_vet_appointments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing cached appointments:", e);
      }
    }
    return [
      { id: "APT-500", petId: "PL-2026-4548", petName: "Miya", petPhoto: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=400", reason: "fever", date: "2026-10-02", status: "Upcoming" },
      { id: "APT-501", petId: "PET-104", petName: "Kalu", petPhoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400", reason: "De-worming dosage follow-up", date: "2026-07-15", status: "Upcoming" },
      { id: "APT-502", petId: "PET-103", petName: "Mani", petPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400", reason: "Post-surgery stitches inspection", date: "2026-07-16", status: "Upcoming" }
    ];
  });

  const fetchVetAppointments = async () => {
    const tokenToUse = token || localStorage.getItem("petlink_token");
    if (!tokenToUse) return;
    try {
      const res = await client.get("/vetappointments");
      const backendAppointments = res.data;
      if (Array.isArray(backendAppointments) && backendAppointments.length > 0) {
        setVetAppointments((prevAppointments) => {
          const backendMap = new Map(backendAppointments.map((a) => [a.id, a]));
          // Merge updates into matching previous records (updating dates, statuses, etc.)
          const updatedPrev = prevAppointments.map((a) =>
            backendMap.has(a.id) ? { ...a, ...backendMap.get(a.id) } : a
          );
          // Append new records that weren't previously in state
          const prevIds = new Set(prevAppointments.map((a) => a.id));
          const newOnes = backendAppointments.filter((a) => !prevIds.has(a.id));
          const merged = [...newOnes, ...updatedPrev];
          localStorage.setItem("petlink_vet_appointments", JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.error("Failed to load vet appointments from backend:", err.message);
    }
  };

  useEffect(() => {
    fetchVetAppointments();
  }, [token, user?.id]);

  const [complaints, setComplaints] = useState(initialComplaints);

  // Expanded Portal States
  const [drives, setDrives] = useState([
    { id: "DRV-601", name: "Kothrud Anti-Rabies Drive", date: "2026-08-15", location: "Kothrud Depot", targetCount: 50, completedCount: 15, status: "In Progress", volunteers: ["VOL-301", "VOL-305"] },
    { id: "DRV-602", name: "Hadapsar Cattle Deworming", date: "2026-08-20", location: "Hadapsar Bypass", targetCount: 30, completedCount: 0, status: "Planned", volunteers: ["VOL-303"] }
  ]);

  const [ngoTransfers, setNgoTransfers] = useState([
    { id: "TRF-701", animalId: "PET-103", animalName: "Mani", sourceNGO: "Kothrud Feline Cattery", destinationNGO: "Pune Central Animal Shelter", reason: "Shelter capacity constraints in cattery. Requesting transfer to main campus.", status: "Pending" }
  ]);

  const [petMemories, setPetMemories] = useState([
    { id: "MEM-801", petId: "PET-104", photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400", caption: "Kalu's first day running in the garden! He loves chasing butterflies.", date: "2026-07-20" }
  ]);

  const [grantDisbursements, setGrantDisbursements] = useState([
    { id: "GNT-901", ngoName: "Pune Central Animal Shelter", amount: 500000, date: "2026-07-01", purpose: "Sterilization Drive Grant (Kothrud Ward)" },
    { id: "GNT-902", ngoName: "Hadapsar Gaushala Cattle Shelter", amount: 800000, date: "2026-07-15", purpose: "Gaushala Shelter Renovation and Shade Expansion" }
  ]);

  const [complianceAlerts, setComplianceAlerts] = useState([
    { id: "ALT-001", ngoName: "Hadapsar Gaushala Cattle Shelter", type: "Capacity Threshold Warning", description: "Gaushala census has exceeded 90% capacity for 2+ consecutive weeks.", date: "2026-08-01" },
    { id: "ALT-002", ngoName: "Dhayari Stray Welfare Association", type: "Documentation Compliance Gaps", description: "Audit inspection flagged manual drug logs and missing digitized reports.", date: "2026-08-03" }
  ]);

  const [caseNotes, setCaseNotes] = useState([
    { id: "NTS-501", animalId: "PET-101", author: "Rahul Mehta (Volunteer)", text: "Sheru seems a bit shy around other dogs today. Keeping under observation.", timestamp: "2026-07-02 11:30 AM" }
  ]);

  const [activeVetId, setActiveVetId] = useState("VET-1");

  const [scanLogs, setScanLogs] = useState([]);
  const [foundReports, setFoundReports] = useState([]);

  const addCitizenComplaint = (complaintData) => {
    const newCompId = `CMP-${300 + complaints.length + 1}`;
    const newRescueId = `RSC-${200 + rescues.length + 1}`;

    const newComplaint = {
      id: newCompId,
      citizenName: complaintData.name,
      citizenPhone: complaintData.phone,
      location: complaintData.location,
      landmark: complaintData.landmark,
      description: complaintData.description,
      photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
      status: "Reported",
      date: new Date().toISOString().split("T")[0]
    };

    const newRescue = {
      id: newRescueId,
      animalType: complaintData.animalType || "Dog",
      condition: complaintData.description,
      location: `${complaintData.location}, Pune`,
      reportedBy: complaintData.complainantName || "Citizen (Gov Portal)",
      phone: complaintData.contactInfo || "N/A",
      status: "New",
      assignedVolunteer: "None",
      date: new Date().toISOString().split("T")[0],
      x: Math.floor(20 + Math.random() * 60),
      y: Math.floor(20 + Math.random() * 60),
      timeline: [
        { time: "Just Now", title: "Reported via Gov Complaint", desc: `Citizen complaint ${newCompId} received and auto-assigned.` }
      ]
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    setRescues((prev) => [newRescue, ...prev]);
    addToast(`Complaint filed — auto-assigned to Pune Central Animal Shelter`, "success");
  };

  // Helper to add toast
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Add Rescue
  const addRescue = (rescueData) => {
    const newId = `RSC-${200 + rescues.length + 1}`;
    const newRescue = {
      id: newId,
      date: new Date().toISOString().split("T")[0],
      status: rescueData.assignedVolunteer !== "None" ? "Assigned" : "New",
      x: Math.floor(Math.random() * 60) + 20, // random coord for SVG map
      y: Math.floor(Math.random() * 60) + 20,
      timeline: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title: "Report Logged", desc: rescueData.condition }
      ],
      ...rescueData
    };

    setRescues((prev) => [newRescue, ...prev]);
    addToast("Rescue created and added to queue", "success");

    // Assign to volunteer if selected
    if (rescueData.assignedVolunteer && rescueData.assignedVolunteer !== "None") {
      assignVolunteerRescueTask(rescueData.assignedVolunteer, newId, rescueData.condition);
    }
  };

  // Helper to assign a rescue task to a volunteer
  const assignVolunteerRescueTask = (volunteerName, rescueId, condition) => {
    setVolunteers((prevVolunteers) =>
      prevVolunteers.map((vol) => {
        if (vol.name === volunteerName) {
          const newTask = {
            id: `TSK-${Date.now()}`,
            title: `Rescue ${rescueId}: ${condition}`,
            status: "To Do",
            priority: "High"
          };
          return {
            ...vol,
            assignedTaskCount: vol.assignedTaskCount + 1,
            tasks: [newTask, ...vol.tasks]
          };
        }
        return vol;
      })
    );
    addToast(`Dispatched ${volunteerName} to Rescue Case ${rescueId}.`, "info");
  };

  // Update rescue status
  const updateRescueStatus = (rescueId, newStatus) => {
    setRescues((prev) =>
      prev.map((r) => {
        if (r.id === rescueId) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newTimelineItem = {
            time,
            title: `Status changed to ${newStatus}`,
            desc: `Updated by coordinator.`
          };

          // Auto create animal profile on "Rescued"
          if (newStatus === "Rescued" && r.status !== "Rescued") {
            setTimeout(() => {
              const newPetId = `PL-2026-${String(40 + animals.length + 1).padStart(4, '0')}`;
              const autoAnimal = {
                id: newPetId,
                name: `Desi-${r.animalType}`,
                species: r.animalType,
                breed: "Indie Breed",
                status: "Rescued",
                gender: "Unknown",
                age: "Unknown",
                weight: "Unknown",
                photo: r.photo || (r.animalType.toLowerCase() === "cat"
                  ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400"
                  : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"),
                custodian: "Emergency Intake",
                lastUpdated: "Just now",
                healthSummary: {
                  vaccinationStatus: "Not Vaccinated",
                  sterilizationStatus: "Pending",
                  treatmentNotes: `Rescue case reference: ${rescueId}. Condition: ${r.condition}. Needs diagnosis.`
                },
                qrCode: `MOCK-QR-${newPetId}`,
                timeline: [
                  { date: new Date().toISOString().split("T")[0], title: "Admitted via Rescue", description: `Referencing Case ID ${rescueId}.` }
                ],
                documents: []
              };
              setAnimals((prevPets) => [autoAnimal, ...prevPets]);
              addToast(`Created initial animal profile ${newPetId} from rescue!`, "info");
            }, 500);
          }

          return {
            ...r,
            status: newStatus,
            timeline: [...r.timeline, newTimelineItem]
          };
        }
        return r;
      })
    );
    addToast(`Rescue ${rescueId} updated to ${newStatus}.`, "success");
  };

  // Persisted version of updateRescueStatus — also auto-creates a real Animal when status becomes "Rescued"
  const updateRescueStatusPersisted = async (rescueId, newStatus, extraFields = {}) => {
    const rescue = rescues.find((r) => r.id === rescueId);
    if (!rescue) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTimelineItem = {
      time,
      title: `Status changed to ${newStatus}`,
      desc: `Updated by coordinator.`
    };
    const updatedTimeline = [...(rescue.timeline || []), newTimelineItem];

    try {
      const res = await client.put(`/rescues/${rescueId}`, {
        status: newStatus,
        timeline: updatedTimeline,
        ...extraFields
      });
      setRescues((prev) => prev.map((r) => (r.id === rescueId ? res.data : r)));
      addToast(`Rescue ${rescueId} updated to ${newStatus}.`, "success");

      // Auto-create a real Animal profile when marked "Rescued"
      if (newStatus === "Rescued" && rescue.status !== "Rescued") {
        try {
          await addAnimalPersisted({
            name: `Desi-${rescue.animalType}`,
            species: rescue.animalType,
            breed: "Indie Breed",
            status: "Rescued",
            gender: "Unknown",
            age: "Unknown",
            weight: "Unknown",
            photo: rescue.photo || (rescue.animalType?.toLowerCase() === "cat"
              ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400"
              : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"),
            custodian: "Emergency Intake",
            healthSummary: {
              vaccinationStatus: "Not Vaccinated",
              sterilizationStatus: "Pending",
              treatmentNotes: `Rescue case reference: ${rescueId}. Condition: ${rescue.condition}. Needs diagnosis.`
            }
          });
        } catch (err) {
          console.error("Rescue saved, but auto-creating the animal profile failed:", err);
        }
      }

      return res.data;
    } catch (err) {
      addToast("Failed to update rescue in database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of addVolunteerTask
  const addVolunteerTaskPersisted = async (volunteerId, taskTitle, priority = "Medium") => {
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    if (!volunteer) {
      addToast("Volunteer not found in database.", "error");
      throw new Error("Volunteer not found");
    }
    const newTask = { id: `TSK-${Date.now()}`, title: taskTitle, status: "To Do", priority };
    const updatedTasks = [newTask, ...(volunteer.tasks || [])];
    try {
      const res = await client.put(`/volunteers/${volunteerId}`, {
        tasks: updatedTasks,
        assignedTaskCount: (volunteer.assignedTaskCount || 0) + 1
      });
      setVolunteers((prev) => prev.map((v) => (v.id === volunteerId ? res.data : v)));
      addToast(`Task assigned to volunteer.`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to save task to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of updateVolunteerTaskStatus
  const updateVolunteerTaskStatusPersisted = async (volunteerId, taskId, newStatus) => {
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    if (!volunteer) {
      addToast("Volunteer not found in database.", "error");
      throw new Error("Volunteer not found");
    }
    let changeInCount = 0;
    const updatedTasks = (volunteer.tasks || []).map((t) => {
      if (t.id === taskId) {
        if (t.status !== "Done" && newStatus === "Done") changeInCount = -1;
        else if (t.status === "Done" && newStatus !== "Done") changeInCount = 1;
        return { ...t, status: newStatus };
      }
      return t;
    });
    try {
      const res = await client.put(`/volunteers/${volunteerId}`, {
        tasks: updatedTasks,
        assignedTaskCount: Math.max(0, (volunteer.assignedTaskCount || 0) + changeInCount)
      });
      setVolunteers((prev) => prev.map((v) => (v.id === volunteerId ? res.data : v)));
      addToast(`Task status updated to ${newStatus}.`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to update task in database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of updateInventoryStock
  const updateInventoryStockPersisted = async (itemId, changeAmount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) {
      addToast("Inventory item not found in database.", "error");
      throw new Error("Inventory item not found");
    }
    const updatedStock = Math.max(0, item.stock + changeAmount);
    try {
      const res = await client.put(`/inventory/${itemId}`, { stock: updatedStock });
      setInventory((prev) => prev.map((i) => (i.id === itemId ? res.data : i)));
      if (updatedStock < item.threshold && item.stock >= item.threshold) {
        addToast(`Warning: ${item.name} stock level has dropped below threshold!`, "warning");
      }
      return res.data;
    } catch (err) {
      addToast("Failed to update inventory in database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of addShelterInventoryItem — creates a new shelter inventory item from scratch
  const addShelterInventoryItemPersisted = async (itemData) => {
    const newId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      name: itemData.name ? itemData.name.trim() : "Unnamed Item",
      category: itemData.category || "General",
      stock: Number(itemData.stock) || 0,
      unit: itemData.unit || "Units",
      threshold: Number(itemData.threshold) || 10,
      expiryDate: itemData.expiryDate || ""
    };
    try {
      const res = await client.post('/inventory', payload);
      setInventory((prev) => [res.data, ...prev]);
      addToast(`Added "${res.data.name}" to shelter inventory.`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to create inventory item in database. Please try again.", "error");
      console.error("Error creating shelter inventory item:", err);
      throw err;
    }
  };

  // Persisted version of addVolunteer — registers a new volunteer from scratch
  const addVolunteerPersisted = async (volunteerData) => {
    const newId = `VOL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      name: volunteerData.name ? volunteerData.name.trim() : "Volunteer",
      contact: volunteerData.contact ? volunteerData.contact.trim() : "",
      role: volunteerData.role || "General Volunteer",
      assignedTaskCount: 0,
      lastCheckIn: new Date().toISOString(),
      tasks: []
    };
    try {
      const res = await client.post('/volunteers', payload);
      setVolunteers((prev) => [res.data, ...prev]);
      addToast(`Volunteer "${res.data.name}" registered successfully.`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to register volunteer in database. Please try again.", "error");
      console.error("Error registering volunteer:", err);
      throw err;
    }
  };

  // Persisted version of addAdoptionApplication — used by Parent's AdoptionBrowsing
  const addAdoptionApplicationPersisted = async (appData) => {
    const newId = `ADP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      date: new Date().toISOString().split("T")[0],
      status: "Applications Received",
      ...appData,
      id: newId
    };
    try {
      const res = await client.post('/adoptions', payload);
      setAdoptions((prev) => [res.data, ...prev]);
      addToast("Adoption application submitted successfully!", "success");
      return res.data;
    } catch (err) {
      addToast("Failed to submit application. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of updateAdoptionStatus — also transfers custody when Approved (handled by backend)
  const updateAdoptionStatusPersisted = async (adoptionId, newStatus) => {
    const existing = adoptions.find((a) => a.id === adoptionId);
    let appData = null;

    if (!persistedAdoptionIds.current.has(adoptionId)) {
      // Mock application not yet saved in MongoDB — auto-create via POST directly to prevent 404
      try {
        const createRes = await client.post('/adoptions', { ...(existing || { id: adoptionId }), status: newStatus });
        appData = createRes.data;
        persistedAdoptionIds.current.add(adoptionId);
      } catch (postErr) {
        try {
          const putRes = await client.put(`/adoptions/${adoptionId}`, { status: newStatus });
          appData = putRes.data;
          persistedAdoptionIds.current.add(adoptionId);
        } catch (putErr) {
          appData = { ...(existing || {}), id: adoptionId, status: newStatus };
        }
      }
    } else {
      try {
        const res = await client.put(`/adoptions/${adoptionId}`, { status: newStatus });
        appData = res.data;
        persistedAdoptionIds.current.add(adoptionId);
      } catch (err) {
        if (err.response && err.response.status === 404 && existing) {
          try {
            const createRes = await client.post('/adoptions', { ...existing, status: newStatus });
            appData = createRes.data;
            persistedAdoptionIds.current.add(adoptionId);
          } catch (postErr) {
            appData = { ...existing, status: newStatus };
          }
        } else {
          addToast("Failed to update application. Please try again.", "error");
          console.warn("Could not update adoption status on backend:", err.message);
          appData = { ...(existing || {}), id: adoptionId, status: newStatus };
        }
      }
    }

    if (appData) {
      setAdoptions((prev) => prev.map((a) => (a.id === adoptionId ? appData : a)));
      addToast(`Adoption application for ${appData.animalName || "pet"} updated to: ${newStatus}`, "info");

      if (newStatus === "Approved") {
        // Merge the freshly-transferred animal into local state — never replace the whole list
        try {
          const animalRes = await client.get(`/animals`);
          setAnimals((prevAnimals) =>
            prevAnimals.map((a) => {
              const updated = animalRes.data.find((b) => b.id === a.id);
              return updated || a;
            }).concat(
              animalRes.data.filter((b) => !prevAnimals.some((a) => a.id === b.id))
            )
          );
        } catch (err) {
          console.error("Approved, but failed to refresh animal list:", err);
        }
        setTimeout(() => {
          addToast(`Custody transferred. Parent Portal access granted. Government stats updated.`, "success");
        }, 800);
      }

      return appData;
    }
  };

  const addDonationPersisted = async (donationData) => {
    const newId = `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      date: new Date().toISOString().split("T")[0],
      ...donationData,
      id: newId
    };
    try {
      const res = await client.post('/donations', payload);
      setDonations((prev) => [res.data, ...prev]);
      addToast(`Donation of ₹${res.data.amount.toLocaleString('en-IN')} logged. Thank you, ${res.data.donorName}!`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to save donation to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of scheduleFollowUp
  const scheduleFollowUpPersisted = async (adoptionId, date, interval) => {
    const existing = adoptions.find((a) => a.id === adoptionId);
    let appData = null;

    if (!persistedAdoptionIds.current.has(adoptionId)) {
      try {
        const createRes = await client.post('/adoptions', {
          ...(existing || { id: adoptionId }),
          status: "Follow-up Scheduled",
          followUpDate: date,
          followUpInterval: interval
        });
        appData = createRes.data;
        persistedAdoptionIds.current.add(adoptionId);
      } catch (postErr) {
        try {
          const putRes = await client.put(`/adoptions/${adoptionId}`, {
            status: "Follow-up Scheduled",
            followUpDate: date,
            followUpInterval: interval
          });
          appData = putRes.data;
          persistedAdoptionIds.current.add(adoptionId);
        } catch (putErr) {
          appData = {
            ...(existing || {}),
            id: adoptionId,
            status: "Follow-up Scheduled",
            followUpDate: date,
            followUpInterval: interval
          };
        }
      }
    } else {
      try {
        const res = await client.put(`/adoptions/${adoptionId}`, {
          status: "Follow-up Scheduled",
          followUpDate: date,
          followUpInterval: interval
        });
        appData = res.data;
        persistedAdoptionIds.current.add(adoptionId);
      } catch (err) {
        if (err.response && err.response.status === 404 && existing) {
          try {
            const createRes = await client.post('/adoptions', {
              ...existing,
              status: "Follow-up Scheduled",
              followUpDate: date,
              followUpInterval: interval
            });
            appData = createRes.data;
            persistedAdoptionIds.current.add(adoptionId);
          } catch (postErr) {
            appData = {
              ...existing,
              status: "Follow-up Scheduled",
              followUpDate: date,
              followUpInterval: interval
            };
          }
        } else {
          addToast("Failed to schedule follow-up. Please try again.", "error");
          console.warn("Could not schedule follow-up on backend:", err.message);
          appData = {
            ...(existing || {}),
            id: adoptionId,
            status: "Follow-up Scheduled",
            followUpDate: date,
            followUpInterval: interval
          };
        }
      }
    }

    if (appData) {
      setAdoptions((prev) => prev.map((a) => (a.id === adoptionId ? appData : a)));
      addToast(`Follow-up scheduled in ${interval} days (on ${date}).`, "success");
      return appData;
    }
  };

  // 2. Add Animal Profile
  const addAnimal = (animalData) => {
    const newId = animalData.id || `PL-2026-${String(40 + animals.length + 1).padStart(4, '0')}`;
    const newAnimal = {
      id: newId,
      lastUpdated: "Just now",
      qrCode: `MOCK-QR-${newId}`,
      timeline: [
        { date: new Date().toISOString().split("T")[0], title: "Profile Created", description: "Profile initialized in system." }
      ],
      documents: [],
      healthSummary: {
        vaccinationStatus: animalData.vaccinationStatus || "Not Vaccinated",
        sterilizationStatus: animalData.sterilizationStatus || "Pending",
        treatmentNotes: animalData.treatmentNotes || "Initial health assessment pending."
      },
      ...animalData
    };
    setAnimals((prev) => [newAnimal, ...prev]);
    addToast(`Animal profile created — ID ${newId}`, "success");
  };

  // Persisted version — used only by Register New Pet (Parent Portal)
  const registerPetPersisted = async (animalData) => {
    try {
      const res = await client.post("/animals", animalData);
      setAnimals((prev) => [res.data, ...prev]);
      addToast(`Family Pet ${res.data.name} registered successfully!`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to save pet to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of addRescue — used by NGO's New Rescue form
  const addRescuePersisted = async (rescueData) => {
    const newId = `RSC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      date: new Date().toISOString().split("T")[0],
      status: rescueData.assignedVolunteer && rescueData.assignedVolunteer !== "None" ? "Assigned" : "New",
      x: Math.floor(Math.random() * 60) + 20,
      y: Math.floor(Math.random() * 60) + 20,
      timeline: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title: "Report Logged", desc: rescueData.condition }
      ],
      ...rescueData,
      id: newId
    };
    try {
      const res = await client.post('/rescues', payload);
      setRescues((prev) => [res.data, ...prev]);
      addToast("Rescue created and added to queue", "success");

      if (rescueData.assignedVolunteer && rescueData.assignedVolunteer !== "None") {
        assignVolunteerRescueTask(rescueData.assignedVolunteer, newId, rescueData.condition);
      }
      return res.data;
    } catch (err) {
      addToast("Failed to save rescue to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // General-purpose persisted version of addAnimal — used by NGO's New Animal Profile and Bulk Import
  const addAnimalPersisted = async (animalData) => {
    // Always generate our own unique ID — never trust the frontend's preview/guessed id,
    // since local array length can drift from what's actually in MongoDB and cause collisions.
    const newId = `PL-2026-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      lastUpdated: "Just now",
      qrCode: `MOCK-QR-${newId}`,
      timeline: [
        { date: new Date().toISOString().split("T")[0], title: "Profile Created", description: "Profile initialized in system." }
      ],
      documents: [],
      healthSummary: {
        vaccinationStatus: animalData.vaccinationStatus || "Not Vaccinated",
        sterilizationStatus: animalData.sterilizationStatus || "Pending",
        treatmentNotes: animalData.treatmentNotes || "Initial health assessment pending."
      },
      ...animalData,
      assignedVetId: animalData.assignedVetId || "VET-1",
      id: newId
    };
    try {
      const res = await client.post('/animals', payload);
      setAnimals((prev) => [res.data, ...prev]);
      addToast(`Animal profile created — ID ${newId}`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to save animal to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  // Persisted version of updateAnimal — saves any status/field change to the backend
  const updateAnimalPersisted = async (animalId, updatedFields) => {
    try {
      const res = await client.put(`/animals/${animalId}`, updatedFields);
      setAnimals((prev) =>
        prev.map((pet) => (pet.id === animalId ? res.data : pet))
      );
      addToast(`Animal ${animalId} profile updated.`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to save update to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };


  // Update Animal Info
  const updateAnimal = (animalId, updatedFields, silent = false) => {
    setAnimals((prev) =>
      prev.map((pet) => {
        if (pet.id === animalId) {
          const updated = { ...pet, ...updatedFields };
          // If sub-health updates are provided
          if (updatedFields.healthSummary) {
            updated.healthSummary = { ...pet.healthSummary, ...updatedFields.healthSummary };
          }
          return updated;
        }
        return pet;
      })
    );
    if (!silent) {
      addToast(`Animal ${animalId} profile updated.`, "success");
    }
  };

  // 3. Update Adoption Application Status
  const updateAdoptionStatus = (adoptionId, newStatus) => {
    let applicantName = "";
    let animalId = "";
    let animalName = "";

    setAdoptions((prev) =>
      prev.map((app) => {
        if (app.id === adoptionId) {
          applicantName = app.applicantName;
          animalId = app.animalId;
          animalName = app.animalName;
          return { ...app, status: newStatus };
        }
        return app;
      })
    );

    addToast(`Adoption application for ${animalName} updated to: ${newStatus}`, "info");

    // If approved, trigger the custody transfer simulation
    if (newStatus === "Approved" && animalId) {
      // 1. Update the animal status to "Adopted"
      setAnimals((prevPets) =>
        prevPets.map((p) => {
          if (p.id === animalId) {
            return {
              ...p,
              status: "Adopted",
              custodian: `${applicantName} (Adoptive Parent)`,
              lastUpdated: "Just now",
              timeline: [
                ...p.timeline,
                { date: new Date().toISOString().split("T")[0], title: "Adopted", description: `Adoption approved. Transferred to ${applicantName}.` }
              ]
            };
          }
          return p;
        })
      );

      // 2. Play Toast message for Event Engine
      setTimeout(() => {
        addToast(
          `Custody transferred. Parent Portal access granted. Government stats updated.`,
          "success"
        );
      }, 800);
    }
  };

  const addAdoptionApplication = (appData) => {
    const newId = `ADP-${500 + adoptions.length + 1}`;
    const newApp = {
      id: newId,
      date: new Date().toISOString().split("T")[0],
      status: "Applications Received",
      ...appData
    };
    setAdoptions((prev) => [newApp, ...prev]);
    addToast("Adoption application submitted successfully!", "success");
  };

  // Schedule follow up
  const scheduleFollowUp = (adoptionId, date, interval) => {
    setAdoptions((prev) =>
      prev.map((app) => {
        if (app.id === adoptionId) {
          return {
            ...app,
            followUpDate: date,
            followUpInterval: interval,
            status: "Follow-up Scheduled"
          };
        }
        return app;
      })
    );
    addToast(`Follow-up scheduled in ${interval} days (on ${date}).`, "success");
  };

  // 4. Add Donation
  const addDonation = (donationData) => {
    const newId = `DON-${400 + donations.length + 1}`;
    const newDonation = {
      id: newId,
      date: new Date().toISOString().split("T")[0],
      ...donationData
    };
    setDonations((prev) => [newDonation, ...prev]);
    addToast(`Donation of ₹${newDonation.amount.toLocaleString('en-IN')} logged. Thank you, ${newDonation.donorName}!`, "success");
  };

  // 5. Add Volunteer Task / Update Task
  const addVolunteerTask = (volunteerId, taskTitle, priority = "Medium") => {
    const newTaskId = `TSK-${Date.now()}`;
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === volunteerId) {
          const newTask = { id: newTaskId, title: taskTitle, status: "To Do", priority };
          return {
            ...v,
            assignedTaskCount: v.assignedTaskCount + 1,
            tasks: [newTask, ...v.tasks]
          };
        }
        return v;
      })
    );
    addToast(`Task assigned to volunteer.`, "success");
  };

  const updateVolunteerTaskStatus = (volunteerId, taskId, newStatus) => {
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === volunteerId) {
          let changeInCount = 0;
          const updatedTasks = v.tasks.map((t) => {
            if (t.id === taskId) {
              // If moving from active to done, reduce count
              if (t.status !== "Done" && newStatus === "Done") {
                changeInCount = -1;
              } else if (t.status === "Done" && newStatus !== "Done") {
                changeInCount = 1;
              }
              return { ...t, status: newStatus };
            }
            return t;
          });
          return {
            ...v,
            assignedTaskCount: Math.max(0, v.assignedTaskCount + changeInCount),
            tasks: updatedTasks
          };
        }
        return v;
      })
    );
    addToast(`Task status updated to ${newStatus}.`, "success");
  };

  // 6. Connect Volunteer to Unassigned Rescue Case
  const assignVolunteerToRescueCase = (volunteerId, rescueId) => {
    let volunteerName = "";
    let rescueCondition = "";

    // 1. Find the volunteer name and add task
    setVolunteers((prevVolunteers) =>
      prevVolunteers.map((vol) => {
        if (vol.id === volunteerId) {
          volunteerName = vol.name;
          const newTask = {
            id: `TSK-${Date.now()}`,
            title: `Rescue Case ${rescueId}`,
            status: "To Do",
            priority: "High"
          };
          return {
            ...vol,
            assignedTaskCount: vol.assignedTaskCount + 1,
            tasks: [newTask, ...vol.tasks]
          };
        }
        return vol;
      })
    );

    // 2. Update the rescue record
    setRescues((prevRescues) =>
      prevRescues.map((rescue) => {
        if (rescue.id === rescueId) {
          rescueCondition = rescue.condition;
          return {
            ...rescue,
            assignedVolunteer: volunteerName,
            status: "Assigned",
            timeline: [
              ...rescue.timeline,
              { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title: "Volunteer Assigned", desc: `Dispatched to ${volunteerName}` }
            ]
          };
        }
        return rescue;
      })
    );

    addToast(`Assigned to ${volunteerName}`, "success");
  };

  // 7. Update inventory
  const updateInventoryStock = (itemId, changeAmount) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedStock = Math.max(0, item.stock + changeAmount);
          if (updatedStock < item.threshold && item.stock >= item.threshold) {
            addToast(`Warning: ${item.name} stock level has dropped below threshold!`, "warning");
          }
          return { ...item, stock: updatedStock };
        }
        return item;
      })
    );
  };

  // 8. Vet Portal Handlers
  const addOrUpdateVetInventoryItem = (itemData) => {
    setVetInventory((prev) => {
      const existing = prev.find(item =>
        (itemData.id && item.id === itemData.id) ||
        (itemData.name && item.name.toLowerCase() === itemData.name.toLowerCase())
      );
      if (existing) {
        addToast(`Stock updated — ${existing.name} +${itemData.stock} ${existing.unit}`, "success");
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, stock: item.stock + Number(itemData.stock) }
            : item
        );
      } else {
        const newId = `VMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newItem = {
          id: newId,
          name: itemData.name,
          stock: Number(itemData.stock),
          unit: itemData.unit,
          threshold: Number(itemData.threshold || 10),
          expiryDate: itemData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        };
        addToast(`New stock added — ${newItem.name} (${newItem.stock} ${newItem.unit})`, "success");
        return [...prev, newItem];
      }
    });
  };

  const scheduleVetAppointment = (petId, petName, petPhoto, reason, date) => {
    const newApt = {
      id: `APT-${Date.now()}`,
      petId,
      petName,
      petPhoto: petPhoto || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
      reason,
      date,
      status: "Upcoming"
    };
    setVetAppointments((prev) => [newApt, ...prev]);
    addToast(`Follow-up appointment scheduled for ${petName}`, "success");
  };

  const completeVetAppointment = (appointmentId) => {
    setVetAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "Completed" } : apt))
    );
    addToast("Appointment marked as completed", "success");
  };

  // Extended Action Handlers
  const addDrive = (driveData) => {
    const newDrive = {
      id: `DRV-${600 + drives.length + 1}`,
      completedCount: 0,
      status: "Planned",
      ...driveData
    };
    setDrives((prev) => [newDrive, ...prev]);
    addToast("New animal welfare drive scheduled!", "success");
  };

  const logDriveAnimalCompletion = (driveId) => {
    setDrives((prev) =>
      prev.map((drv) => {
        if (drv.id === driveId) {
          const updatedCompleted = drv.completedCount + 1;
          const isDone = updatedCompleted >= drv.targetCount;
          return {
            ...drv,
            completedCount: updatedCompleted,
            status: isDone ? "Completed" : drv.status
          };
        }
        return drv;
      })
    );
    addToast("Logged animal completion to drive!", "success");
  };

  const requestNGOTransfer = (transferData) => {
    const newTransfer = {
      id: `TRF-${700 + ngoTransfers.length + 1}`,
      status: "Pending",
      ...transferData
    };
    setNgoTransfers((prev) => [newTransfer, ...prev]);
    addToast(`Transfer request filed for ${transferData.animalName}`, "success");
  };

  const respondToNGOTransfer = (transferId, action) => {
    let animalId = "";
    let targetNGO = "";
    let animalName = "";

    setNgoTransfers((prev) =>
      prev.map((trf) => {
        if (trf.id === transferId) {
          animalId = trf.animalId;
          targetNGO = trf.destinationNGO;
          animalName = trf.animalName;
          return { ...trf, status: action };
        }
        return trf;
      })
    );

    if (action === "Approved" && animalId) {
      setAnimals((prev) =>
        prev.map((pet) => {
          if (pet.id === animalId) {
            return {
              ...pet,
              custodian: targetNGO,
              lastUpdated: "Just now",
              timeline: [
                ...pet.timeline,
                { date: new Date().toISOString().split("T")[0], title: "NGO Custody Transfer", description: `Custodian updated to ${targetNGO} via approved transfer request.` }
              ]
            };
          }
          return pet;
        })
      );
      addToast(`Transfer approved! ${animalName} moved to ${targetNGO}.`, "success");
    } else {
      addToast(`Transfer request for ${animalName} was ${action.toLowerCase()}.`, "info");
    }
  };

  const addPetMemory = (memoryData) => {
    const newMemory = {
      id: `MEM-${800 + petMemories.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      ...memoryData
    };
    setPetMemories((prev) => [newMemory, ...prev]);
    addToast("Memory added to pet journal!", "success");
  };

  const addCaseNote = (noteData) => {
    const newNote = {
      id: `NTS-${500 + caseNotes.length + 1}`,
      timestamp: new Date().toLocaleString(),
      ...noteData
    };
    setCaseNotes((prev) => [newNote, ...prev]);
    addToast("Internal case note saved", "success");
  };

  const reassignVetCase = (petId, newVetId) => {
    setAnimals((prev) =>
      prev.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            assignedVetId: newVetId,
            timeline: [
              ...pet.timeline,
              { date: new Date().toISOString().split("T")[0], title: "Case Reassigned", description: `Assigned veterinarian updated to ${newVetId === "VET-1" ? "Dr. Dev Karve" : "Dr. Ananya Rao"}.` }
            ]
          };
        }
        return pet;
      })
    );
    addToast(`Case reassigned successfully`, "success");
  };

  // --- QR Found Pet Scan Flow Actions ---
  // --- QR Found Pet Scan Flow Actions ---
  const logTagScan = async (animalId, location) => {
    const newId = `SCN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      animalId,
      timestamp: new Date().toLocaleString(),
      location: location || "Kothrud Ward Area"
    };
    try {
      const res = await client.post('/scanlogs', payload);
      setScanLogs((prev) => [res.data, ...prev]);
      // Refresh this animal locally so the new timeline entry shows immediately
      const animalRes = await client.get('/animals');
      setAnimals((prevAnimals) =>
        prevAnimals.map((a) => {
          const updated = animalRes.data.find((b) => b.id === a.id);
          return updated || a;
        })
      );
    } catch (err) {
      console.error("Failed to log tag scan:", err);
    }
  };


  const submitFoundReport = async (animalId, reportData) => {
    const pet = animals.find(p => p.id === animalId);
    if (!pet) {
      console.warn(`submitFoundReport blocked: Pet ${animalId} not found.`);
      return;
    }

    const newId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      animalId,
      reportedAt: new Date().toLocaleString(),
      finderLocation: reportData.finderLocation || "Unknown coordinates",
      finderPhoto: reportData.finderPhoto || "",
      finderContact: reportData.finderContact || "",
      status: "Pending"
    };

    try {
      const res = await client.post('/foundreports', payload);
      setFoundReports((prev) => [res.data, ...prev]);
      addToast(`🚨 Lost pet ${pet.name} scanned! Finder report submitted.`, "warning");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to submit found report. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  const confirmFoundMatch = async (reportId) => {
    const report = foundReports.find((r) => r.id === reportId);
    if (!report) return;
    const pet = animals.find((p) => p.id === report.animalId);

    try {
      const res = await client.put(`/foundreports/${reportId}`, { status: "Confirmed" });
      setFoundReports((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));

      // Refresh the affected animal's local state from the backend (the transfer already happened server-side)
      const animalRes = await client.get('/animals');
      setAnimals((prevAnimals) =>
        prevAnimals.map((a) => {
          const updated = animalRes.data.find((b) => b.id === a.id);
          return updated || a;
        })
      );

      addToast(`Match confirmed! ${pet ? pet.name : "Animal"} has been reunited with their custodian.`, "success");
    } catch (err) {
      addToast("Failed to confirm match in database. Please try again.", "error");
      console.error(err);
    }
  };

  const dismissFoundReport = async (reportId) => {
    try {
      const res = await client.put(`/foundreports/${reportId}`, { status: "Dismissed" });
      setFoundReports((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));
      addToast("Found report dismissed.", "info");
    } catch (err) {
      addToast("Failed to dismiss report in database. Please try again.", "error");
      console.error(err);
    }
  };

  const addOrUpdateVetInventoryItemPersisted = async (itemData) => {
    const existing = vetInventory.find(item =>
      (itemData.id && item.id === itemData.id) ||
      (itemData.name && item.name.toLowerCase() === itemData.name.toLowerCase())
    );

    try {
      if (existing) {
        const res = await client.put(`/vetinventory/${existing.id}`, {
          stock: existing.stock + Number(itemData.stock)
        });
        setVetInventory((prev) => prev.map((item) => (item.id === existing.id ? res.data : item)));
        addToast(`Stock updated — ${res.data.name} +${itemData.stock} ${res.data.unit}`, "success");
      } else {
        const newId = `VMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payload = {
          id: newId,
          name: itemData.name,
          stock: Number(itemData.stock),
          unit: itemData.unit,
          threshold: Number(itemData.threshold || 10),
          expiryDate: itemData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        };
        const res = await client.post('/vetinventory', payload);
        setVetInventory((prev) => [...prev, res.data]);
        addToast(`New stock added — ${res.data.name} (${res.data.stock} ${res.data.unit})`, "success");
      }
    } catch (err) {
      addToast("Failed to save inventory to database. Please try again.", "error");
      console.error(err);
      throw err;
    }
  };

  const scheduleVetAppointmentPersisted = async (petId, petName, petPhoto, reason, date) => {
    const newId = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: newId,
      petId,
      petName,
      petPhoto: petPhoto || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
      reason,
      date,
      status: "Upcoming"
    };

    try {
      const res = await client.post('/vetappointments', payload);
      setVetAppointments((prev) => [res.data, ...prev]);
      addToast(`Follow-up appointment scheduled for ${petName || 'pet'}`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to schedule appointment in database. Please try again.", "error");
      console.error("scheduleVetAppointmentPersisted error:", err);
      throw err;
    }
  };

  const completeVetAppointmentPersisted = async (appointmentId) => {
    try {
      const res = await client.put(`/vetappointments/${appointmentId}`, { status: "Completed" });
      setVetAppointments((prev) => {
        const updated = prev.map((apt) => (apt.id === appointmentId ? res.data : apt));
        localStorage.setItem("petlink_vet_appointments", JSON.stringify(updated));
        return updated;
      });
      addToast("Appointment marked as completed", "success");
      return res.data;
    } catch (err) {
      addToast("Failed to update appointment status. Please try again.", "error");
      console.error("completeVetAppointmentPersisted error:", err);
      throw err;
    }
  };

  const rescheduleVetAppointmentPersisted = async (appointmentId, newDate) => {
    // 1. Immediately update React state and localStorage for instant feedback
    let targetApt = null;
    setVetAppointments((prev) => {
      const updated = prev.map((apt) => {
        if (apt.id === appointmentId) {
          targetApt = { ...apt, date: newDate };
          return targetApt;
        }
        return apt;
      });
      localStorage.setItem("petlink_vet_appointments", JSON.stringify(updated));
      return updated;
    });

    // 2. Persist to MongoDB backend
    try {
      const payload = {
        date: newDate,
        ...(targetApt ? {
          petId: targetApt.petId,
          petName: targetApt.petName,
          petPhoto: targetApt.petPhoto,
          reason: targetApt.reason,
          status: targetApt.status
        } : {})
      };
      const res = await client.put(`/vetappointments/${appointmentId}`, payload);
      if (res.data) {
        setVetAppointments((prev) => {
          const updated = prev.map((apt) => (apt.id === appointmentId ? { ...apt, ...res.data } : apt));
          localStorage.setItem("petlink_vet_appointments", JSON.stringify(updated));
          return updated;
        });
      }
      addToast(`Appointment rescheduled to ${newDate}`, "success");
      return res.data;
    } catch (err) {
      console.warn("Backend reschedule warning:", err);
      addToast(`Appointment rescheduled to ${newDate}`, "success");
    }
  };

  const requestVetAppointment = async (petId, vetId, requestedDate, reason) => {
    try {
      const res = await client.post('/vetappointments/request', { petId, vetId, requestedDate, reason });
      setVetAppointments((prev) => [res.data, ...prev]);
      addToast(`Appointment request sent to vet!`, "success");
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to send appointment request. Please try again.";
      addToast(msg, "error");
      console.error("requestVetAppointment error:", err);
      throw err;
    }
  };

  const respondToVetAppointment = async (appointmentId, action, proposedDate) => {
    try {
      const payload = { action };
      if (proposedDate) payload.proposedDate = proposedDate;
      const res = await client.put(`/vetappointments/${appointmentId}/respond`, payload);
      setVetAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? res.data : apt))
      );
      const actionLabel = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'accepted with a new time';
      addToast(`Booking request ${actionLabel}.`, "success");
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to respond to appointment request. Please try again.";
      addToast(msg, "error");
      console.error("respondToVetAppointment error:", err);
      throw err;
    }
  };

  // fetchVets does NOT store in global state — VetDirectory manages its own local vet list
  // since the vet directory is a single-page listing not shared across the app
  const fetchVets = async (cityFilter) => {
    try {
      const params = cityFilter ? `?city=${encodeURIComponent(cityFilter)}` : '';
      const res = await client.get(`/vets${params}`);
      return res.data;
    } catch (err) {
      console.error("fetchVets error:", err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        animals,
        animalsLoaded,
        refreshAnimals: fetchAnimals,
        rescues,
        volunteers,
        donations,
        adoptions,
        inventory,
        toasts,
        addToast,
        removeToast,
        addRescue,
        addRescuePersisted,
        updateRescueStatus,
        updateRescueStatusPersisted,
        addAnimal,
        addAnimalPersisted,
        registerPetPersisted,
        updateAnimal,
        updateAnimalPersisted,
        updateAdoptionStatus,
        addAdoptionApplication,
        addAdoptionApplicationPersisted,
        updateAdoptionStatusPersisted,
        scheduleFollowUp,
        scheduleFollowUpPersisted,
        addDonation,
        addDonationPersisted,
        addVolunteerTask,
        addVolunteerTaskPersisted,
        addVolunteerPersisted,
        updateVolunteerTaskStatus,
        updateVolunteerTaskStatusPersisted,
        assignVolunteerToRescueCase,
        updateInventoryStock,
        updateInventoryStockPersisted,
        addShelterInventoryItemPersisted,
        vetInventory,
        vetAppointments,
        addOrUpdateVetInventoryItem,
        addOrUpdateVetInventoryItemPersisted,
        scheduleVetAppointment,
        scheduleVetAppointmentPersisted,
        completeVetAppointment,
        completeVetAppointmentPersisted,
        rescheduleVetAppointmentPersisted,
        requestVetAppointment,
        respondToVetAppointment,
        fetchVets,
        complaints,
        addCitizenComplaint,
        drives,
        addDrive,
        logDriveAnimalCompletion,
        ngoTransfers,
        requestNGOTransfer,
        respondToNGOTransfer,
        petMemories,
        addPetMemory,
        grantDisbursements,
        complianceAlerts,
        caseNotes,
        addCaseNote,
        activeVetId,
        setActiveVetId,
        reassignVetCase,
        scanLogs,
        foundReports,
        logTagScan,
        submitFoundReport,
        confirmFoundMatch,
        dismissFoundReport
      }}
    >
      {children}
    </AppContext.Provider>
  );

};
