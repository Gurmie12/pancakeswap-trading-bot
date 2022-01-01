import React from 'react';
import NavbarLinkContainer from "./NavbarLinkContainer/navbarLinkContainer";
import {Box} from "@chakra-ui/react";
import './Navbar.css';
import NavbarUserContainer from "./NavbarUserContainer/NavbarUserContainer";

const Navbar = () =>{
    return(
        <Box className="navbar-container" bg="teal.50" boxShadow="dark-lg" p={3}>
            <NavbarLinkContainer />
            <NavbarUserContainer />
        </Box>
    )
}

export default Navbar;