import React from 'react';
import {Box} from "@chakra-ui/react";
import {BellIcon, InfoIcon, SettingsIcon} from "@chakra-ui/icons";
import NavbarLink from "../NavbarLink/NavbarLink";
import './navbarLinkContainer.css';

const NavbarLinkContainer = () => {
    return (
        <Box className="navbar-link-container">
            <NavbarLink path={""} logoIcon={<InfoIcon w={6} h={6}/>} title={"Progress"} />
            <NavbarLink path={"calls"} logoIcon={<BellIcon w={6} h={6}/>} title={"New Calls"} />
            <NavbarLink path={"profile"} logoIcon={<SettingsIcon w={6} h={6}/>} title={"Profile"} />
        </Box>
    )
}

export default NavbarLinkContainer;