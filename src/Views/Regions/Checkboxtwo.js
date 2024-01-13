import React from 'react'

export const CheckBoxTwo = props => {
    return (
      <li>
       <input key={props.id} onClick={props.handleCheckChieldElement} type="checkbox" checked={props.regiontwo} value={props.county} /> {props.county}
      </li>
    )
}

export default CheckBoxTwo