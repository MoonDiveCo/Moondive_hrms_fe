
import HolidayCalender from "@/components/LeaveTracker/HolidayCalender";

import LeaveDashboard from "@/components/LeaveTracker/LeaveDashboard";
import LeaveRequest from "@/components/LeaveTracker/LeaveRequest";


const SECTION_COMPONENTS = {
  "leave-dashboard": LeaveDashboard,
    "holiday-calender": HolidayCalender,
 "leave-request":LeaveRequest
//   designations: Designations,
};

export default async function SectionPage({ params }) {

const { headerKey,sectionSlug } = await params;
   const SectionComponent =  sectionSlug?SECTION_COMPONENTS[sectionSlug] || (() => <div>Not found</div>):SECTION_COMPONENTS[headerKey];

  return <SectionComponent />;
}