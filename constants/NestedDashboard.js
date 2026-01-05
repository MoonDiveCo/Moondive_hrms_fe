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

export const ACTION_PERMISSIONS = {
  HRMS_MANAGE_ACCOUNT_VIEW: 'HRMS:MANAGE_ACCOUNT:VIEW',
  HRMS_EMPLOYES_VIEW: 'HRMS:EMPLOYES:VIEW',
  HRMS_EMPLOYES_WRITE: 'HRMS:EMPLOYES:WRITE',
  HRMS_EMPLOYES_EDIT: 'HRMS:EMPLOYES:EDIT',
  HRMS_EMPLOYES_DELETE: 'HRMS:EMPLOYES:DELETE',

  HRMS_OVERVIEW_VIEW: 'HRMS:HRMS_OVERVIEW:VIEW',
  HRMS_LEAVE_TRACKER_VIEW: 'HRMS:LEAVE_TRACKER:VIEW',
  HRMS_ATTENDANCE_VIEW: 'HRMS:ATTENDANCE:VIEW',
  HRMS_TIME_TRACKER_VIEW: 'HRMS:TIME_TRACKER:VIEW',
  HRMS_PERFORMANCE_VIEW: 'HRMS:PERFORMANCE:VIEW',
  HRMS_DOCUMENTS_VIEW: 'HRMS:DOCUMENTS:VIEW',

  HRMS_COMPANY_POLICY_VIEW: 'HRMS:COMPANY_POLICY:VIEW',
  HRMS_COMPANY_POLICY_WRITE: 'HRMS:COMPANY_POLICY:WRITE',
  HRMS_COMPANY_POLICY_EDIT: 'HRMS:COMPANY_POLICY:EDIT',
  HRMS_COMPANY_POLICY_DELETE: 'HRMS:COMPANY_POLICY:DELETE',

  HRMS_LEAVE_VIEW:"HRMS:LEAVE:VIEW",
  HRMS_LEAVE_EDIT:"HRMS:LEAVE:EDIT",
  HRMS_LEAVE_WRITE:"HRMS:LEAVE:WRITE",
  HRMS_LEAVE_DELETE:"HRMS:LEAVE:DELETE",

  // HRMS_LOCATION_VIEW:"HRMS:LOCATION:VIEW",
  // HRMS_LOCATION_WRITE:"HRMS:LOCATION:WRITE",
  // HRMS_LOCATION_EDIT:"HRMS:LOCATION:EDIT",
  // HRMS_LOCATION_DELETE:"HRMS:LOCATION:DELETE",

  // HRMS_DEPARTMENT_VIEW:"HRMS:DEPARTMENT:VIEW",

  // HRMS_DESIGNATION_VIEW:"HRMS:DESIGNATION:VIEW",

  // HRMS_PERMISSIONS_VIEW:"HRMS:PERMISSIONS:VIEW",

  HRMS_SHIFT_VIEW: 'HRMS:SHIFT:VIEW',
  HRMS_SHIFT_WRITE: 'HRMS:SHIFT:WRITE',
  HRMS_SHIFT_EDIT: 'HRMS:SHIFT:EDIT',
  HRMS_SHIFT_DELETE: 'HRMS:SHIFT:DELETE',

  HRMS_OPERATIONS_VIEW:'HRMS:OPERATIONS:VIEW',
  HRMS_ANALYTICS_VIEW:'HRMS:ANALYTICS:VIEW',
  HRMS_SETTINGS_VIEW:'HRMS:SETTINGS:VIEW',

  CMS_OVERVIEW_VIEW: 'CMS:CMS_OVERVIEW:VIEW',
  
  CMS_BLOGS_VIEW: 'CMS:BLOGS:VIEW',
  CMS_BLOGS_WRITE:'CMS:BLOGS:WRITE',
  CMS_BLOGS_EDIT:'CMS:BLOGS:EDIT',
  CMS_BLOGS_DELETE:'CMS:BLOGS:DELETE',

  CMS_TESTIMONIALS_VIEW: 'CMS:TESTIMONIALS:VIEW',
  CMS_TESTIMONIALS_WRITE:'CMS:TESTIMONIALS:WRITE',
  CMS_TESTIMONIALS_EDIT:'CMS:TESTIMONIALS:EDIT',
  CMS_TESTIMONIALS_DELETE:'CMS:TESTIMONIALS:DELETE',

  CMS_CASE_STUDIES_VIEW: 'CMS:CASE_STUDIES:VIEW',
  CMS_CASE_STUDIES_WRITE:'CMS:CASE_STUDIES:WRITE',
  CMS_CASE_STUDIES_EDIT:'CMS:CASE_STUDIES:EDIT',
  CMS_CASE_STUDIES_DELETE:'CMS:CASE_STUDIES:DELETE',


  CMS_COMPARISIONS_VIEW: 'CMS:COMPARISIONS:VIEW',
  CMS_COMPARISIONS_WRITE:'CMS:COMPARISIONS:WRITE',
  CMS_COMPARISIONS_EDIT:'CMS:COMPARISIONS:EDIT',
  CMS_COMPARISIONS_DELETE:'CMS:COMPARISIONS:DELETE',

  CMS_SUMMARIES_VIEW: 'CMS:SUMMARIES:VIEW',
  CMS_SUMMARIES_WRITE:'CMS:SUMMARIES:WRITE',
  CMS_SUMMARIES_EDIT:'CMS:SUMMARIES:EDIT',
  CMS_SUMMARIES_DELETE:'CMS:SUMMARIES:DELETE',

  CMS_INDUSTARIES_VIEW: 'CMS:INDUSTARIES:VIEW',
  CMS_INDUSTARIES_WRITE:'CMS:INDUSTARIES:WRITE',
  CMS_INDUSTARIES_EDIT:'CMS:INDUSTARIES:EDIT',
  CMS_INDUSTARIES_DELETE:'CMS:INDUSTARIES:DELETE',
  
  CMS_WEBSITE_SEO_VIEW: 'CMS:WEBSITE_SEO:VIEW',
  CMS_WEBSITE_SEO_WRITE:'CMS:WEBSITE_SEO:WRITE',
  CMS_WEBSITE_SEO_EDIT:'CMS:WEBSITE_SEO:EDIT',
  CMS_WEBSITE_SEO_DELETE:'CMS:WEBSITE_SEO:DELETE',

  CMS_CONTENT_PERFORMANCE_VIEW: 'CMS:CONTENT_PERFORMANCE:VIEW',
  CMS_CONTENT_PERFORMANCE_WRITE:'CMS:CONTENT_PERFORMANCE:WRITE',
  CMS_CONTENT_PERFORMANCE_EDIT:'CMS:CONTENT_PERFORMANCE:EDIT',
  CMS_CONTENT_PERFORMANCE_DELETE:'CMS:CONTENT_PERFORMANCE:DELETE',

  CMS_GENAI_VISIBILITY_VIEW: 'CMS:GENAI_VISIBILITY:VIEW',
  CMS_GENAI_VISIBILITY_WRITE:'CMS:GENAI_VISIBILITY:WRITE',
  CMS_GENAI_VISIBILITY_EDIT:'CMS:GENAI_VISIBILITY:EDIT',
  CMS_GENAI_VISIBILITY_DELETE:'CMS:GENAI_VISIBILITY:DELETE',

  CMS_INVENTORY_VIEW: 'CMS:INVENTORY:VIEW',
  CMS_INVENTORY_WRITE: 'CMS:INVENTORY:WRITE',
  CMS_INVENTORY_EDIT: 'CMS:INVENTORY:EDIT',
  CMS_INVENTORY_DELETE: 'CMS:INVENTORY:DELETE',


  CRM_OVERVIEW_VIEW: 'CRM:CRM_OVERVIEW:VIEW',
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


