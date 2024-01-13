import React from 'react'

export const CheckBox = props => {
    return (
      <li>
       <input key={props.id} onClick={props.handleCheckChieldElement} type="checkbox" checked={props.regionone} value={props.county} /> {props.county}
      </li>
    )
}

export default CheckBox