import React from "react";
import { Td,Tr } from "react-super-responsive-table";

export const AttendanceCheckBox = props =>{
    return (
        <Tr key={props.id+1}>
             <Td>
                                                    {props.account_name}
                                                    </Td>

                                                    <Td>
                                                    {props.mobile_number}
                                                    </Td>
                                                    <Td>
                                                    {props.email}
                                                    </Td>
                                                    <Td>
                                                    {props.corporate}
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
    )
};
export default AttendanceCheckBox;