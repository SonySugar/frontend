import React from "react";
import { Td,Tr } from "react-super-responsive-table";

export const FarmersCheckBox = props =>{
    return (
       
        <Tr>
            <Td style={{textAlign: "left"}}>
                {props.firstname}
            </Td>
            <Td style={{textAlign: "left"}}>{props.lastname}</Td>
            <Td style={{textAlign: "left"}}>{props.phonenumber_one}</Td>
            <Td style={{textAlign: "right"}}>

            
            <input
            key={props.id}
            onClick={props.handleCheckChildElement}
            type="checkbox"
            checked={props.checked}
            value={props.id}
            id={props.id}
            />
            </Td>
        </Tr>
        
    )
};
export default FarmersCheckBox;