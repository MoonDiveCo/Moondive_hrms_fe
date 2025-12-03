import React from "react";
const SectionHeading = ({top, main, position='center'}) => {
    return ( 
        <div style={{textAlign: position}}>
            {top && <h3 className="text-[0.9rem] 2xl:text-[1.2rem] uppercase tracking-[4px] font-semibold text-highlight">{top}</h3>}
            <h2 className="font-semibold text-">{main}</h2>
        </div>
    );
}
 
export default SectionHeading;