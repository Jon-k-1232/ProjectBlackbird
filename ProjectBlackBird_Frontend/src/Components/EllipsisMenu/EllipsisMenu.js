import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function EllipsisMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = anchorEl;

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = event => {
    setAnchorEl(null);

    // If the edit prop is passed will pass a true boolean back to parent
    if (event.target.selected === 'Edit') props.edit(true);
  };

  return (
    <div>
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch'
          }
        }}>
        {props.menuOptions.map(option => (
          <MenuItem key={option} selected={option} onClick={event => handleClose(event)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
