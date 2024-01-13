import React from "react";
import { Tbody,Td,Tr } from "react-super-responsive-table";

export const CountiesCheckBox = props =>{
    return (
        <Tbody>
        <Tr key={props.id}>
            <Td>
                {props.county}
            </Td>
            <Td>

            
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
        </Tbody>
    )
};
export default CountiesCheckBox;