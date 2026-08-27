import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
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
  const [animals, setAnimals] = useState(initialAnimals);

  // Merge any real backend-registered animals with the existing mock data on load
  useEffect(() => {
    client.get("/animals")
      .then((res) => {
        const backendAnimals = res.data;
        setAnimals((prevAnimals) => {
          const existingIds = new Set(prevAnimals.map((a) => a.id));
          const newOnes = backendAnimals.filter((a) => !existingIds.has(a.id));
          return [...newOnes, ...prevAnimals];
        });
      })
      .catch((err) => {
        console.error("Failed to load animals from backend:", err.message);
      })
      .finally(() => setAnimalsLoaded(true));
  }, []);

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
    client.get("/adoptions")
      .then((res) => {
        const backendAdoptions = res.data;
        setAdoptions((prevAdoptions) => {
          const existingIds = new Set(prevAdoptions.map((a) => a.id));
          const newOnes = backendAdoptions.filter((a) => !existingIds.has(a.id));
          return [...newOnes, ...prevAdoptions];
        });
      })
      .catch((err) => {
        console.error("Failed to load adoptions from backend:", err.message);
      });
  }, []);

  const [rescues, setRescues] = useState(initialRescues);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [donations, setDonations] = useState(initialDonations);
  const [adoptions, setAdoptions] = useState(initialAdoptions);
  const [inventory, setInventory] = useState(initialInventory);
  const [toasts, setToasts] = useState([]);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);

  // Vet Portal State Setup
  const [vetInventory, setVetInventory] = useState([
    { id: "VMD-101", name: "Rabies Vaccine (Rabigen)", stock: 45, unit: "Vials", threshold: 15, expiryDate: "2027-02-14" },
    { id: "VMD-102", name: "Feline Triple Vaccine (Feligen)", stock: 8, unit: "Vials", threshold: 10, expiryDate: "2026-11-20" },
    { id: "VMD-103", name: "Meloxicam Painkiller (Suspension)", stock: 12, unit: "Bottles", threshold: 5, expiryDate: "2027-06-05" },
    { id: "VMD-104", name: "Enrofloxacin Antibiotics (50mg)", stock: 120, unit: "Tablets", threshold: 50, expiryDate: "2028-01-10" },
    { id: "VMD-105", name: "Sterile Gauze Rolls & Bandages", stock: 65, unit: "Packs", threshold: 20, expiryDate: "2029-05-30" }
  ]);

  const [vetAppointments, setVetAppointments] = useState([
    { id: "APT-501", petId: "PET-104", petName: "Kalu", petPhoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400", reason: "De-worming dosage follow-up", date: "2026-07-15", status: "Upcoming" },
    { id: "APT-502", petId: "PET-103", petName: "Mani", petPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400", reason: "Post-surgery stitches inspection", date: "2026-07-16", status: "Upcoming" }
  ]);

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
    try {
      const res = await client.put(`/adoptions/${adoptionId}`, { status: newStatus });
      setAdoptions((prev) => prev.map((a) => (a.id === adoptionId ? res.data : a)));
      addToast(`Adoption application for ${res.data.animalName} updated to: ${newStatus}`, "info");

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

      return res.data;
    } catch (err) {
      addToast("Failed to update application in database. Please try again.", "error");
      console.error(err);
      throw err;
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
    try {
      const res = await client.put(`/adoptions/${adoptionId}`, {
        status: "Follow-up Scheduled",
        followUpDate: date,
        followUpInterval: interval
      });
      setAdoptions((prev) => prev.map((a) => (a.id === adoptionId ? res.data : a)));
      addToast(`Follow-up scheduled in ${interval} days (on ${date}).`, "success");
      return res.data;
    } catch (err) {
      addToast("Failed to schedule follow-up. Please try again.", "error");
      console.error(err);
      throw err;
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
        const newId = `VMD-${100 + prev.length + 1}`;
        const newItem = {
          id: newId,
          name: itemData.name,
          stock: Number(itemData.stock),
          unit: itemData.unit,
          threshold: Number(itemData.threshold || 10),
          expiryDate: itemData.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0]
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

  return (
    <AppContext.Provider
      value={{
        animals,
        animalsLoaded,
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
        updateVolunteerTaskStatus,
        updateVolunteerTaskStatusPersisted,
        assignVolunteerToRescueCase,
        updateInventoryStock,
        updateInventoryStockPersisted,
        vetInventory,
        vetAppointments,
        addOrUpdateVetInventoryItem,
        scheduleVetAppointment,
        completeVetAppointment,
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
