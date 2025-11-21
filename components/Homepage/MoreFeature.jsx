import Box from "../Common/Box";
import Performance from "../../public/Homepage/Performance.png"; 
import SmartAttendance from "../../public/Homepage/SmartAttendance.png"; 

const MoreFeature = () => {
  return (
    <div className="container ">
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-16 px-8">
      <Box
        bgClass="bg-[#EBFFF5]"
        borderClass="border-[#30FFFC42]"
        title="Clear insights to guide every HR decision."
        description="Visualize key HR metrics and trends through powerful, easy-to-understand analytics to support smarter decision-making."
        img={Performance}
        alt="HR Insights dashboard"
        maxHeight="220px"
      />

      <Box
        bgClass="bg-white"
        borderClass="border-[#FF7B3042]"
        title="Smart Attendance"
        description="Automate time tracking and attendance records"
        img={SmartAttendance}
        alt="Smart attendance performance"
        maxHeight="280px"
      />
    </div>
    </div>
 
  );
};

export default MoreFeature;
