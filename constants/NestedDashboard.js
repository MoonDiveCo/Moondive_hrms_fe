
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
export const DASHBOARD_HEADERS = {
  "leave-tracker": LEAVE_TRACKER_HEADER,
  "manage-accounts": MANAGE_ACCOUNTS_HEADER,
};
