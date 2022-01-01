import React from 'react';
import {Box, Heading, VStack} from "@chakra-ui/react";
import {useNavigate} from 'react-router-dom';
import './NavbarLink.css';

const NavbarLink = ({logoIcon, path, title}) =>{
    const navigate = useNavigate();

    const handleClick = () =>{
        navigate(`/${path}`);
    }

    return(
        <Box boxShadow="md" p={3} className="navbar-link" bg="teal.100" onClick={handleClick}>
            <VStack spacing={3}>
                {logoIcon}
                <Heading as="h3" size="sm">{title}</Heading>
            </VStack>
        </Box>
    )
}

export default NavbarLink;