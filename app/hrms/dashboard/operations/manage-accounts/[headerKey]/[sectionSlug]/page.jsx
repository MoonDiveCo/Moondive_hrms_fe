import OrganizationDetails from "@/components/ManageAccounts/Organization/OrganizationDetails";
import Locations from "@/components/ManageAccounts/Organization/Locations";
import Departments from "@/components/ManageAccounts/Organization/Departments";
import Designations from "@/components/ManageAccounts/Organization/Designations";
const SECTION_COMPONENTS = {
  "organization-details": OrganizationDetails,
  locations: Locations,
  departments: Departments,
  designations: Designations,
};

export default async function SectionPage({ params }) {
  const { sectionSlug } = await params;


  const SectionComponent =
    SECTION_COMPONENTS[sectionSlug] || (() => <div>Not found</div>);

  return <SectionComponent />;
}
