import axios from "axios";
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
      { slug: "assigned-permission", label: "Assigned Permission" },
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

// export const ACTION_PERMISSIONS = {

//   HRMS_EMPLOYEE_VIEW: 'HRMS:EMPLOYES:VIEW',
//   HRMS_EMPLOYEE_WRITE: 'HRMS:EMPLOYES:WRITE',
//   HRMS_EMPLOYEE_EDIT: 'HRMS:EMPLOYES:EDIT',
//   HRMS_EMPLOYEE_DELETE: 'HRMS:EMPLOYES:DELETE',


//   CRM_ACCOUNTS_VIEW: 'CRM:ACCOUNTS:VIEW',
//   CRM_ACCOUNTS_WRITE: 'CRM:ACCOUNTS:WRITE',
//   CRM_ACCOUNTS_EDIT: 'CRM:ACCOUNTS:EDIT',
//   CRM_ACCOUNTS_DELETE: 'CRM:ACCOUNTS:DELETE',

//   CRM_SALES_VIEW: 'CRM:SALES:VIEW',
//   CRM_SALES_WRITE: 'CRM:SALES:WRITE',
//   CRM_SALES_EDIT: 'CRM:SALES:EDIT',
//   CRM_SALES_DELETE: 'CRM:SALES:DELETE',

//   HRMS_PERFORMANCE_VIEW: 'HRMS:PERFORMANCE:VIEW',

//   HRMS_ATTENDANCE_VIEW: 'HRMS:ATTENDANCE:VIEW',
//   HRMS_ATTENDANCE_EDIT: 'HRMS:ATTENDANCE:EDIT',

//   HRMS_MANAGE_ACCOUNT_VIEW:'HRMS:MANAGE_ACCOUNT:VIEW',

//   HRMS_LEAVE_POLICY_VIEW:'HRMS:LEAVE_POLICY:VIEW',
//   HRMS_LEAVE_POLICY_WRITE:'HRMS:LEAVE_POLICY:WRITE',
//   HRMS_LEAVE_POLICY_EDIT:'HRMS:LEAVE_POLICY:EDIT',
//   HRMS_LEAVE_POLICY_DELETE:'HRMS:LEAVE_POLICY:DELETE',

//   HRMS_COMPANY_POLICY_VIEW:'HRMS:COMPANY_POLICY:VIEW',
//   HRMS_COMPANY_POLICY_WRITE:'HRMS:COMPANY_POLICY:WRITE',
//   HRMS_COMPANY_POLICY_EDIT:'HRMS:COMPANY_POLICY:EDIT',
//   HRMS_COMPANY_POLICY_DELETE:'HRMS:COMPANY_POLICY:DELETE',

//   HRMS_SHIFT_VIEW:'HRMS:SHIFT:VIEW',
//   HRMS_SHIFT_WRITE:'HRMS:SHIFT:WRITE',
//   HRMS_SHIFT_EDIT:'HRMS:SHIFT:EDIT',
//   HRMS_SHIFT_DELETE:'HRMS:SHIFT:DELETE',

//   CMS_CONTENT_WRITER_VIEW: 'CMS:CONTENT_WRITER:VIEW',
//   CMS_CONTENT_WRITER_WRITE: 'CMS:CONTENT_WRITER:WRITE',
//   CMS_CONTENT_WRITER_EDIT: 'CMS:CONTENT_WRITER:EDIT',
//   CMS_CONTENT_WRITER_DELETE: 'CMS:CONTENT_WRITER:DELETE',


// };

export const ACTION_PERMISSIONS = {
  /* ================= HRMS ================= */

  HRMS_EMPLOYEE_VIEW: 'HRMS:EMPLOYES:VIEW',
  HRMS_EMPLOYEE_WRITE: 'HRMS:EMPLOYES:WRITE',
  HRMS_EMPLOYEE_EDIT: 'HRMS:EMPLOYES:EDIT',
  HRMS_EMPLOYEE_DELETE: 'HRMS:EMPLOYES:DELETE',

  HRMS_OVERVIEW_VIEW: 'HRMS:OVERVIEW:VIEW',
  HRMS_LEAVE_TRACKER_VIEW: 'HRMS:LEAVE_TRACKER:VIEW',
  HRMS_ATTENDANCE_VIEW: 'HRMS:ATTENDANCE:VIEW',
  HRMS_TIME_TRACKER_VIEW: 'HRMS:TIME_TRACKER:VIEW',
  HRMS_PERFORMANCE_VIEW: 'HRMS:PERFORMANCE:VIEW',
  HRMS_DOCUMENTS_VIEW: 'HRMS:DOCUMENTS:VIEW',

  HRMS_MANAGE_ACCOUNT_VIEW: 'HRMS:MANAGE_ACCOUNT:VIEW',

  HRMS_LEAVE_POLICY_VIEW: 'HRMS:LEAVE_POLICY:VIEW',
  HRMS_LEAVE_POLICY_WRITE: 'HRMS:LEAVE_POLICY:WRITE',
  HRMS_LEAVE_POLICY_EDIT: 'HRMS:LEAVE_POLICY:EDIT',
  HRMS_LEAVE_POLICY_DELETE: 'HRMS:LEAVE_POLICY:DELETE',

  HRMS_COMPANY_POLICY_VIEW: 'HRMS:COMPANY_POLICY:VIEW',
  HRMS_COMPANY_POLICY_WRITE: 'HRMS:COMPANY_POLICY:WRITE',
  HRMS_COMPANY_POLICY_EDIT: 'HRMS:COMPANY_POLICY:EDIT',
  HRMS_COMPANY_POLICY_DELETE: 'HRMS:COMPANY_POLICY:DELETE',

  HRMS_SHIFT_VIEW: 'HRMS:SHIFT:VIEW',
  HRMS_SHIFT_WRITE: 'HRMS:SHIFT:WRITE',
  HRMS_SHIFT_EDIT: 'HRMS:SHIFT:EDIT',
  HRMS_SHIFT_DELETE: 'HRMS:SHIFT:DELETE',


  CMS_OVERVIEW_VIEW: 'CMS:OVERVIEW:VIEW',
  CMS_BLOGS_VIEW: 'CMS:BLOGS:VIEW',
  CMS_TESTIMONIALS_VIEW: 'CMS:TESTIMONIALS:VIEW',
  CMS_CASE_STUDIES_VIEW: 'CMS:CASE_STUDIES:VIEW',
  CMS_COMPARISIONS_VIEW: 'CMS:COMPARISIONS:VIEW',
  CMS_SUMMARIES_VIEW: 'CMS:SUMMARIES:VIEW',
  CMS_INDUSTARIES_VIEW: 'CMS:INDUSTARIES:VIEW',
  CMS_WEBSITE_SEO_VIEW: 'CMS:WEBSITE_SEO_VIEW',
  CMS_CONTENT_PERFORMANCE_VIEW: 'CMS:CONTENT_PERFORMANCE:VIEW',
  CMS_GENAI_VISIBILITY_VIEW: 'CMS:GENAI_VISIBILITY_VIEW',
  CMS_INVENTORY_VIEW: 'CMS:INVENTORY:VIEW',

  CMS_CONTENT_WRITER_VIEW: 'CMS:CONTENT_WRITER:VIEW',
  CMS_CONTENT_WRITER_WRITE: 'CMS:CONTENT_WRITER:WRITE',
  CMS_CONTENT_WRITER_EDIT: 'CMS:CONTENT_WRITER:EDIT',
  CMS_CONTENT_WRITER_DELETE: 'CMS:CONTENT_WRITER:DELETE',

  /* ================= CRM ================= */

  CRM_OVERVIEW_VIEW: 'CRM:OVERVIEW:VIEW',
  CRM_ACCOUNTS_VIEW: 'CRM:ACCOUNTS:VIEW',
  CRM_ACCOUNTS_WRITE: 'CRM:ACCOUNTS:WRITE',
  CRM_ACCOUNTS_EDIT: 'CRM:ACCOUNTS:EDIT',
  CRM_ACCOUNTS_DELETE: 'CRM:ACCOUNTS:DELETE',

  CRM_SALES_VIEW: 'CRM:SALES:VIEW',
  CRM_SALES_WRITE: 'CRM:SALES:WRITE',
  CRM_SALES_EDIT: 'CRM:SALES:EDIT',
  CRM_SALES_DELETE: 'CRM:SALES:DELETE',

  CRM_LEADS_VIEW: 'CRM:LEADS:VIEW',
  CRM_IN_PROCESS_VIEW: 'CRM:IN_PROCESS:VIEW',
  CRM_MEETING_SCHEDULE_VIEW: 'CRM:MEETING_SCHEDULE:VIEW',
  CRM_FINALISED_VIEW: 'CRM:FINALISED:VIEW',
};


// export const ROLE_ACTION_PERMISSIONS = {
//   SuperAdmin: ['*',],

//   ADMIN: [
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_VIEW,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_WRITE,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_EDIT,
//     ACTION_PERMISSIONS.HRMS_MANAGE_ACCOUNT_VIEW,

//   ],


//   HR: [
//     ACTION_PERMISSIONS.HRMS_PERFORMANCE_VIEW,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_DELETE,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_EDIT,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_VIEW,
//     ACTION_PERMISSIONS.HRMS_EMPLOYEE_WRITE,
//     ACTION_PERMISSIONS.HRMS_COMPANY_POLICY_WRITE,
//     ACTION_PERMISSIONS.HRMS_COMPANY_POLICY_EDIT,
//     ACTION_PERMISSIONS.HRMS_COMPANY_POLICY_DELETE,
//   ],

//   'Content Writer': [
//     ACTION_PERMISSIONS.CMS_CONTENT_WRITER_VIEW,
//     ACTION_PERMISSIONS.CMS_CONTENT_WRITER_WRITE,
//     ACTION_PERMISSIONS.CMS_CONTENT_WRITER_EDIT,
//     ACTION_PERMISSIONS.CMS_CONTENT_WRITER_DELETE,
//   ],
//   ACCOUNTANT: [
//     ACTION_PERMISSIONS.CRM_ACCOUNTS_VIEW,
//     ACTION_PERMISSIONS.CRM_ACCOUNTS_WRITE,
//     ACTION_PERMISSIONS.CRM_ACCOUNTS_EDIT,
//   ],

//   SALES: [
//     ACTION_PERMISSIONS.CRM_SALES_VIEW,
//     ACTION_PERMISSIONS.CRM_SALES_WRITE,
//     ACTION_PERMISSIONS.CRM_SALES_EDIT,
//   ],
// };

// export function hasPermission(user, permission) {
//   if (!user) return false;

//   const userRoles = Array.isArray(user.userRole)
//     ? user.userRole
//     : [user.userRole];

//   const rolePermissions = userRoles.flatMap(
//     (role) => ROLE_ACTION_PERMISSIONS[role] || []
//   );

  
//   if (rolePermissions.includes('*')) {
//     return true;
//   }

//   const additionalPermissions = user.additionalPermissions || [];

//   const allPermissions = new Set([
//     ...rolePermissions,
//     ...additionalPermissions,
//   ]);

//   return allPermissions.has(permission);
// }

// export function getUserActionPermissions(user) {
//   if (!user) return [];

//   const userRoles = Array.isArray(user.userRole)
//     ? user.userRole
//     : [user.userRole];

//   let permissions = new Set();

//   for (const role of userRoles) {
//     const rolePerms = ROLE_ACTION_PERMISSIONS[role] || [];

//     if (rolePerms.includes('*')) {
//       return [...Object.values(ACTION_PERMISSIONS),"HRMS:EMPLOYEE:VIEW"];
//     }

//     rolePerms.forEach((perm) => permissions.add(perm));
//   }

//   if (Array.isArray(user.additionalPermissions)) {
//     user.additionalPermissions.forEach((perm) =>
//       permissions.add(perm)
//     );
//   }
//   permissions.add("HRMS:EMPLOYEE:VIEW")
  
//   return Array.from(permissions);
// }