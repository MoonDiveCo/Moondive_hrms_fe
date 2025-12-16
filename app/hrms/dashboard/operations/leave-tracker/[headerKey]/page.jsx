import EmploymentGroup from "@/components/LeaveTracker/EmploymentGroup";
import LeaveCalender from "@/components/LeaveTracker/LeaveCalender";
import LeavePoliciesPage from "@/components/LeaveTracker/LeaveTypes";

const SECTION_COMPONENTS = {
  "leave-policy": LeavePoliciesPage,
    "employment-group": EmploymentGroup,
 "leave-calender":LeaveCalender
//   designations: Designations,
};

export default async function SectionPage({ params }) {

const { headerKey,sectionSlug } = await params;
   const SectionComponent =  sectionSlug?SECTION_COMPONENTS[sectionSlug] || (() => <div>Not found</div>):SECTION_COMPONENTS[headerKey];

  return <SectionComponent />;
}