export const MANAGE_ACCOUNTS_HEADER = [

  {
    key: "organization",
    label: "Organization",
    basePath: "/hrms/dashboard/manage-accounts/organization",
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
    basePath: "/hrms/dashboard/manage-accounts/user-access-control",
    sections: [
      { slug: "roles", label: "Roles" },
      { slug: "permissions", label: "Permissions" },
    ],
  },
];