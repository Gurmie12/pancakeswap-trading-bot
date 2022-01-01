import React, {useContext} from 'react';
import {Box, Button, Switch, Text} from '@chakra-ui/react';
import {LockIcon} from '@chakra-ui/icons'
import './NavbarUserContainer.css';
import {EthContext} from "../../../providers/EthProvider";
import API from '../../../clients/api.js';

const words = "";


const NavbarUserContainer = () =>{
    const {address, setAddress, setBalance, setAutoBuyToggled} = useContext(EthContext);

    const connectWallet = () =>{
        API.post('/connect', {phrase: words})
            .then((res) =>{
                if(res.data.status === 'success'){
                    setBalance(res.data.data.balance);
                    setAddress(res.data.data.address);
                }else{
                    console.log('Something went wrong!')
                }
            })
            .catch((err) =>{
                console.log(err);
            })
    }

    return(
        <Box className="navbar-user-actions-container">
            <Box className={"auto-buy-toggle-container"}>
                <Switch size="lg" onChange={e => setAutoBuyToggled(e.target.checked)}/>
                <Text>Auto-buy</Text>
            </Box>
            <Button colorScheme="teal" className="connect-wallet-button" onClick={connectWallet}>{address ? "Connected!" : 'Connect'}</Button>
            <Button colorScheme="teal" leftIcon={<LockIcon />} className="logout-button">Logout</Button>
        </Box>
    )
}

export default NavbarUserContainer;