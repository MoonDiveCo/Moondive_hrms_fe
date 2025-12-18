import OrganizationDetails from "@/components/ManageAccounts/Organization/OrganizationDetails";
import Locations from "@/components/ManageAccounts/Organization/Locations";
import Departments from "@/components/ManageAccounts/Organization/Departments";
import Designations from "@/components/ManageAccounts/Organization/Designations";
import GeneralRole from "@/components/ManageAccounts/UserAccessControl/GeneralRole";
import AssignedRole from "@/components/ManageAccounts/UserAccessControl/AssignedRole";

const SECTION_COMPONENTS = {
  "organization-details": OrganizationDetails,
  locations: Locations,
  departments: Departments,
  designations: Designations,
  "general-role":GeneralRole,
  "assigned-role":AssignedRole
};

export default async function SectionPage({ params }) {
  const { sectionSlug } = await params;


  const SectionComponent =
    SECTION_COMPONENTS[sectionSlug] || (() => <div>Not found</div>);

  return <SectionComponent />;
}
