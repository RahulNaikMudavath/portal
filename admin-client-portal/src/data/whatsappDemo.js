export const chats = [
  {
    _id: "1",

    customerName: "Raj Builders",

    phoneNumber: "+91 9876543210",

    subject: "Need House Estimation",

    priority: "High",

    aiSummary:
      "Customer requires a house estimation for a residential project. Floor plan PDF has been shared. Budget is around ₹25 Lakhs.",

    attachments: [
      {
        fileName: "FloorPlan.pdf",
        type: "pdf",
        url: "#",
      },
    ],

    conversation: [
      {
        sender: "Customer",
        message: "Hello Sir",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "Need house estimation.",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "Budget around ₹25 Lakhs.",
        createdAt: new Date(),
      },
      {
        sender: "Admin",
        message: "Sure sir, please share the floor plan.",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "I've attached the floor plan PDF.",
        createdAt: new Date(),
      },
    ],
  },

  {
    _id: "2",

    customerName: "Vinay Constructions",

    phoneNumber: "+91 9988776655",

    subject: "Building Approval",

    priority: "Medium",

    aiSummary:
      "Customer needs building approval for a residential project. Documents have been shared.",

    attachments: [
      {
        fileName: "BuildingPlan.pdf",
        type: "pdf",
        url: "#",
      },
    ],

    conversation: [
      {
        sender: "Customer",
        message: "Need building approval.",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "Sending the plan.",
        createdAt: new Date(),
      },
      {
        sender: "Admin",
        message: "Received sir. We'll verify and update you.",
        createdAt: new Date(),
      },
    ],
  },

  {
    _id: "3",

    customerName: "ABC Developers",

    phoneNumber: "+91 9123456789",

    subject: "Structural Design",

    priority: "High",

    aiSummary:
      "Customer requires structural design for a G+2 commercial building. Estimated budget ₹1.2 Crores.",

    attachments: [
      {
        fileName: "Structure.pdf",
        type: "pdf",
        url: "#",
      },
    ],

    conversation: [
      {
        sender: "Customer",
        message: "Need structural design.",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "Project is G+2.",
        createdAt: new Date(),
      },
      {
        sender: "Customer",
        message: "Estimated budget is ₹1.2 Crores.",
        createdAt: new Date(),
      },
    ],
  },

  {
    _id: "4",

    customerName: "Ramesh",

    phoneNumber: "+91 9876512345",

    subject: "Interior Estimation",

    priority: "Low",

    aiSummary:
      "Customer requires interior estimation for first floor only.",

    attachments: [],

    conversation: [
      {
        sender: "Customer",
        message: "Need interior estimation.",
        createdAt: new Date(),
      },
      {
        sender: "Admin",
        message: "Sure sir, we'll prepare the quotation.",
        createdAt: new Date(),
      },
    ],
  },
];