export const initialAnimals = [];

export const initialRescues = [
  {
    id: "RSC-201",
    animalType: "Dog",
    condition: "Accident Trauma / Fractured Leg",
    location: "Kothrud, Pune",
    reportedBy: "Suresh Gowda",
    phone: "+91 98765 43210",
    status: "Rescued",
    assignedVolunteer: "Rahul Mehta",
    date: "2026-07-09",
    x: 35,
    y: 65,
    timeline: [
      { time: "10:15 AM", title: "Report Received", desc: "Reported dog hit by a car near Kothrud Depot." },
      { time: "10:30 AM", title: "Volunteer Dispatched", desc: "Rahul Mehta dispatched with ambulance." },
      { time: "11:15 AM", title: "Rescued & Secured", desc: "Animal stabilized and loaded into rescue vehicle." },
      { time: "12:00 PM", title: "Admitted", desc: "Brought to Pune Central Shelter for emergency assessment." }
    ]
  },
  {
    id: "RSC-202",
    animalType: "Cow",
    condition: "Deep Laceration on Back",
    location: "Hadapsar Bypass, Pune",
    reportedBy: "Ritu Patel",
    phone: "+91 98877 66554",
    status: "In Progress",
    assignedVolunteer: "Nikhil Rao",
    date: "2026-07-10",
    x: 75,
    y: 55,
    timeline: [
      { time: "09:00 AM", title: "Report Received", desc: "Stray cow bleeding near flyover construction." },
      { time: "09:30 AM", title: "Volunteer Arrived", desc: "Nikhil Rao on-site. Requesting large-animal ambulance." },
      { time: "11:00 AM", title: "Treatment Commenced", desc: "Wound cleaned on-site; awaiting heavy-duty loader transport." }
    ]
  },
  {
    id: "RSC-203",
    animalType: "Cat",
    condition: "Trapped in Lift Shaft",
    location: "Kalyani Nagar, Pune",
    reportedBy: "Vikram Sen",
    phone: "+91 97766 55443",
    status: "Assigned",
    assignedVolunteer: "Anjali Deshmukh",
    date: "2026-07-10",
    x: 60,
    y: 35,
    timeline: [
      { time: "02:15 PM", title: "Report Received", desc: "Kitten crying in the basement lift shaft of Blue Bells society." },
      { time: "02:30 PM", title: "Assigned", desc: "Assigned to Anjali Deshmukh (Feline specialist)." }
    ]
  },
  {
    id: "RSC-204",
    animalType: "Dog",
    condition: "Severe Skin Mange & Starvation",
    location: "Swargate Bus Stand, Pune",
    reportedBy: "Amit Shinde",
    phone: "+91 96655 44332",
    status: "Rescued",
    assignedVolunteer: "Pooja Sharma",
    date: "2026-07-10",
    x: 45,
    y: 80,
    timeline: [
      { time: "11:30 AM", title: "Report Received", desc: "Hairless street dog shaking near Platform 4." },
      { time: "12:00 PM", title: "Volunteer Arrived", desc: "Pooja on-site. Successfully secured dog with food lure." },
      { time: "01:30 PM", title: "Arrived at Shelter", desc: "Logged as PET-106 (Rani). Treatment initiated." }
    ]
  },
  {
    id: "RSC-205",
    animalType: "Bird",
    condition: "Manjha cut on wings",
    location: "Deccan Gymkhana, Pune",
    reportedBy: "Sunita Deshpande",
    phone: "+91 95544 33221",
    status: "New",
    assignedVolunteer: "None",
    date: "2026-07-10",
    x: 30,
    y: 40,
    timeline: [
      { time: "03:45 PM", title: "Report Received", desc: "Pigeon hanging from tree branches near Deccan bus stop." }
    ]
  }
];

export const initialVolunteers = [];

export const initialDonations = [
  {
    id: "DON-1790258961756-691",
    donorName: "ravi",
    email: "ravi@test.com",
    date: "2026-09-24",
    purpose: "Shelter Expansion Project",
    amount: 100000
  },
  {
    id: "DON-1786239772213-558",
    donorName: "rekha",
    email: "rekha@gmail.com",
    date: "2026-08-09",
    purpose: "Shelter Expansion Project",
    amount: 1000000
  }
];

export const initialAdoptions = [
  {
    id: "ADP-501",
    applicantName: "Siddharth Malhotra",
    applicantContact: "+91 99887 76655",
    animalId: "PET-103",
    animalName: "Mani",
    animalPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
    date: "2026-07-09",
    status: "Applicant Verification",
    notes: "Has a lovely flat in Kalyani Nagar. Previously owned a Persian cat. Clean home check completed."
  },
  {
    id: "ADP-502",
    applicantName: "Prisha Sen",
    applicantContact: "+91 98776 54321",
    animalId: "PET-108",
    animalName: "Rocky",
    animalPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400",
    date: "2026-07-08",
    status: "Applications Received",
    notes: "Family of 4 with a farmhouse in Lonavala. Wants a companion for their existing Labrador."
  },
  {
    id: "ADP-503",
    applicantName: "Kunal Kapoor",
    applicantContact: "+91 98888 77777",
    animalId: "PET-101",
    animalName: "Sheru",
    animalPhoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
    date: "2026-07-07",
    status: "Approved",
    notes: "Passed home background checks. Fully active environment. Ready to sign the adoption contract."
  },
  {
    id: "ADP-504",
    applicantName: "Neha Dhupia",
    applicantContact: "+91 99999 00000",
    animalId: "PET-107",
    animalName: "Billo",
    animalPhoto: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400",
    date: "2026-07-06",
    status: "Follow-up Scheduled",
    notes: "Adopted Billo last week. 7-day virtual checkup due. Report details: Adjusting nicely, healthy eating."
  }
];

export const initialInventory = [
  { id: "INV-001", name: "Dog Food (10kg bags)", category: "Food", stock: 110, threshold: 10, unit: "bags" },
  { id: "INV-01", name: "Rabisin Anti-Rabies Vaccine", category: "Medicine", stock: 120, threshold: 30, unit: "Vials" },
  { id: "INV-02", name: "Puppy Dry Kibble (Pedigree)", category: "Food", stock: 45, threshold: 50, unit: "Bags (10kg)" },
  { id: "INV-03", name: "Cat Dry Kibble (Whiskas)", category: "Food", stock: 22, threshold: 20, unit: "Bags (5kg)" },
  { id: "INV-04", name: "Ivermectin Skin Ointment", category: "Medicine", stock: 15, threshold: 25, unit: "Tubes" },
  { id: "INV-05", name: "Melonex Painkiller", category: "Medicine", stock: 8, threshold: 10, unit: "Bottles" },
  { id: "INV-06", name: "Cattle Green Fodder", category: "Food", stock: 650, threshold: 200, unit: "kg" }
];

export const initialComplaints = [
  { id: "CMP-301", complainantName: "Rakesh Jha", contactInfo: "+91 99223 88122", description: "Injured stray dog near Kothrud Depot.", location: "Kothrud", status: "Assigned", assignedNGO: "Pune Central Animal Shelter", date: "2026-07-10" },
  { id: "CMP-302", complainantName: "Anonymous", contactInfo: "N/A", description: "Cat trapped in lift shaft.", location: "Kalyani Nagar", status: "Assigned", assignedNGO: "Pune Central Animal Shelter", date: "2026-07-10" },
  { id: "CMP-303", complainantName: "Sunita Rao", contactInfo: "+91 98112 33445", description: "Sick street cow near Aundh bypass.", location: "Aundh", status: "Resolved", assignedNGO: "Pune Central Animal Shelter", date: "2026-07-08" }
];
