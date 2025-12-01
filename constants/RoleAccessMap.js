import { ROLE_ACCOUNTANT, ROLE_ADMIN, ROLE_CONTENT_WRITER, ROLE_EMPLOYEE, ROLE_HR, ROLE_SALES, ROLE_SUPERADMIN } from "@/text";

export const ROLE_ACCESS_MAP = {
  [ROLE_SUPERADMIN]: {
    modules: ["*"],
    submodules: ["*"],
    actions: ["*"]
  },

  [ROLE_HR]: {
    modules: ["HRMS"],
    submodules: ["HRMS:HR", "HRMS:EMPLOYEE"],
    actions: [
      "HRMS:HR:VIEW",
      "HRMS:HR:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ]
  },

  [ROLE_EMPLOYEE]: {
    modules: ["HRMS"],
    submodules: ["HRMS:EMPLOYEE"],
    actions: [
      "HRMS:EMPLOYEE:VIEW"
    ]
  },

  [ROLE_CONTENT_WRITER]: {
    modules: ["CMS", "HRMS"],
    submodules: ["CMS:CONTENT_WRITER", "HRMS:EMPLOYEE"],
    actions: [
      "CMS:CONTENT_WRITER:VIEW",
      "CMS:CONTENT_WRITER:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ]
  },

  [ROLE_SALES]: {
    modules: ["CRM", "HRMS"],
    submodules: ["CRM:SALES", "HRMS:EMPLOYEE"],
    actions: [
      "CRM:SALES:VIEW",
      "CRM:SALES:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ]
  },

  [ROLE_ADMIN]: {
    modules: ["HRMS", "CRM", "CMS"],
    submodules: ["HRMS:HR", "HRMS:EMPLOYEE", "CMS:ADMIN"],
    actions: [
      "HRMS:HR:VIEW",
      "HRMS:HR:WRITE",
      "CMS:ADMIN:VIEW",
      "CMS:ADMIN:WRITE"
    ]
  },

  [ROLE_ACCOUNTANT]: {
    modules: ["HRMS", "CRM"],
    submodules: ["CRM:ACCOUNTS", "HRMS:EMPLOYEE"],
    actions: [
      "CRM:ACCOUNTS:VIEW",
      "CRM:ACCOUNTS:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ]
  }
};

export const ACCESS_MAP ={
  [ROLE_SUPERADMIN]: ['*'],

  [ROLE_HR]: [
      "HRMS:HR:VIEW",
      "HRMS:HR:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ],

  [ROLE_EMPLOYEE]: [
      "HRMS:EMPLOYEE:VIEW"
    ],

  [ROLE_CONTENT_WRITER]: [
      "CMS:CONTENT_WRITER:VIEW",
      "CMS:CONTENT_WRITER:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ],

  [ROLE_SALES]: [
      "CRM:SALES:VIEW",
      "CRM:SALES:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ],

  [ROLE_ADMIN]:  [
      "HRMS:HR:VIEW",
      "HRMS:HR:WRITE",
      "CMS:ADMIN:VIEW",
      "CMS:ADMIN:WRITE"
    ],

  [ROLE_ACCOUNTANT]: [
      "CRM:ACCOUNTS:VIEW",
      "CRM:ACCOUNTS:WRITE",
      "HRMS:EMPLOYEE:VIEW"
    ]
}