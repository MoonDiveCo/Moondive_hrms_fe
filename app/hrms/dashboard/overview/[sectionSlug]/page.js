
import Department from "@/components/Overview/Department";
import MySpace from "@/components/Overview/MySpace";


const SECTION_COMPONENTS = {
  "myspace": MySpace,
  "department": Department,
  // "approval": Approval,
  // "organizationpolicy": OrganizationPolicy,
};

export default async function SectionPage({ params }) {
  const { sectionSlug } = await params;
  
  const SectionComponent = SECTION_COMPONENTS[sectionSlug] || (() => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-gray-700">Section not found</h2>
      <p className="text-gray-500 mt-2">The requested section does not exist.</p>
    </div>
  ));
  
  return <SectionComponent />;
}