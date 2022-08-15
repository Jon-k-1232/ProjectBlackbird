import PropTypes from "prop-types";
import { Box } from "@mui/material";
import crow from "../Static_Icons/crow.png";

Logo.propTypes = {
  sx: PropTypes.object,
};

export default function Logo({ sx }) {
  return (
    <Box component="img" src={crow} sx={{ width: 40, height: 40, ...sx }} />
  );
}
