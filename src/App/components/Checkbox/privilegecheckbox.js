import React from "react";
import { Td,Tr } from "react-super-responsive-table";

export const PrivilegeCheckBox = props =>{
    return (
       
        <Tr>
            <Td style={{textAlign: "left"}}>
                {props.description}
            </Td>
            <Td style={{textAlign: "right"}}>

            
            <input
            key={props.id}
            onClick={props.handleCheckChildElement}
            type="checkbox"
            checked={props.is_checked}
            value={props.id}
            id={props.id}
            />
            </Td>
        </Tr>
        
    )
};
export default PrivilegeCheckBox;