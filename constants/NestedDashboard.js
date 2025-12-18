
export const MANAGE_ACCOUNTS_HEADER = [
  {
    key: "organization",
    label: "Organization",
    basePath: "/hrms/dashboard/operations/manage-accounts/organization",
    layoutType: "SIDEBAR", 

    sections: [
      { slug: "organization-details", label: "Organization Details" },
      { slug: "locations", label: "Locations" },
      { slug: "departments", label: "Departments" },
      { slug: "designations", label: "Designations" },
    ],
  },
    {
    key: "user-access-control",
    label: "User Access Control",
    basePath: "/hrms/dashboard/operations/manage-accounts/user-access-control",
    layoutType: "SIDEBAR", 

    sections: [
      { slug: "general-role", label: "General Role" },
      { slug: "assigned-role", label: "Assigned Role" },
    ],
  }
];

const LEAVE_TRACKER_HEADER = [
  {
    key: "leave-policy",
    label: "Leave Policy ",
    basePath: "/hrms/dashboard/operations/leave-tracker/leave-policy",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },
  {
    key: "employment-group",
    label: "Employement Group ",
    basePath: "/hrms/dashboard/operations/leave-tracker/employment-group",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },

  {
    key: "leave-calender",
    label: "Leave Calender ",
    basePath: "/hrms/dashboard/operations/leave-tracker/leave-calender",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },
];

const LEAVE_TRACKER_EMPLOYEE_HEADER = [
  {
    key: "leave-dashboard",
    label: "Leave Dashboard ",
    basePath: "/hrms/dashboard/leave-tracker/leave-dashboard",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },
  {
    key: "holiday-calender",
    label: "Holiday Calender",
    basePath: "/hrms/dashboard/leave-tracker/holiday-calender",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },

  {
    key: "leave-request",
    label: "Leave Request ",
    basePath: "/hrms/dashboard/leave-tracker/leave-request",
        layoutType: "HEADER", 

    sections: [
      {}
    ],
  },
];
export const DASHBOARD_HEADERS = {
  "leave-tracker": {
    patterns: [
      {
        path: ["dashboard", "leave-tracker"],  
        level: 2,                                
        type: "employee",                         
      },
      {
        path: ["dashboard","operations", "leave-tracker"],
        level: 3,
        type: "admin",
      },
    ],
    headers: {
      employee: LEAVE_TRACKER_EMPLOYEE_HEADER,
      admin: LEAVE_TRACKER_HEADER,
    }
  },

  "manage-accounts": {
    patterns: [
      {
        path: ["dashboard","operations", "manage-accounts"],
        level: 4,
        type: "admin",
      }
    ],
    headers: {
      admin: MANAGE_ACCOUNTS_HEADER
    }
  }
};
