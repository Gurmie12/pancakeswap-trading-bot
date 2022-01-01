import React, {useContext, useEffect, useState} from 'react';
import './Progress.css';
import {Box, HStack, Heading, Input, Button, List, ListItem, Text} from '@chakra-ui/react';
import {EthContext} from "../../providers/EthProvider";
import socketClient from "socket.io-client";
import {WEBSOCKET_ENDPOINT} from "./Progress.constants";
import API from "../../clients/api";


const Progress = () =>{
    const {balance, address, purchased, setPurchased, setConnected, connected, autoBuyToggled} = useContext(EthContext);
    const [newPairs, setNewPairs] = useState([]);
    const [purchaseAmountInput, setPurchaseAmountInput] = useState(0.01);
    const [purchaseAmount, setPurchaseAmount] = useState(0.01);
    const [socket, setSocket] = useState(null);

    useEffect(()=>{
        let _socket;
        if(address && !socket){
            API.get('/startPairFinding')
                .then((res) =>{
                    if(res.data.status === 'success'){
                        setConnected(true);
                        _socket = socketClient(WEBSOCKET_ENDPOINT, {rejectUnauthorized: false});
                        _socket.on('newPair', (data) =>{
                            setNewPairs([...newPairs, data]);
                        });
                    }
                })
                .catch((err) =>{
                    console.log(err);
                })

            return () =>{
                _socket.disconnect();
            }
        }
    }, [address]);

    useEffect(() =>{
        if(newPairs.length > 0){
            const token = newPairs[newPairs.length - 1];
            API.post('/buyToken', token)
                .then((res) =>{
                    if(res.data.status === 'success'){
                        console.log('PURHCASED ------', token.tokOut);
                        setPurchased([...purchased, token]);
                    }else{
                        console.log('*****FAILED TRANS****');
                    }
                })
                .catch((err) =>{
                    console.log(err);
                })
        }
    }, [newPairs]);

    // const renderNewPairs = () =>{
    //     return(
    //         <List spacing={4}>
    //             {
    //                 newPairs.map((pair, i) =>{
    //                         return(
    //                             <ListItem key={i} className="new-coin-row">
    //                                 <p>{pair.tokOut}
    //                                     ~ {pair.minReceived.toString()} coins
    //                                 </p>
    //                                 <div className="buy-sell-container">
    //                                     {pair.purchased && <Button onClick={e => sellPair(pair)}>Sell</Button>}
    //                                     <Button onClick={e => buyPair(pair)}>Buy</Button>
    //                                 </div>
    //                             </ListItem>
    //                         );
    //                 })
    //             }
    //         </List>
    //     )
    // }

    const updatePurchaseAmount = () =>{
        setPurchaseAmount(purchaseAmountInput);
    }

    return (
        <Box className="progress-page-container">
            <Box className="top-stats-container">
                <Box boxShadow={'dark-xl'} bg="teal.50" p={3} borderRadius="md" className="top-stat-container">
                    <Heading as="h4" size="md">{address}:</Heading>
                    <br />
                    <Heading as="h1" size="xl">{balance} BNB</Heading>
                    <br />
                    <Text>{connected ? "ON" : "OFF"}</Text>
                </Box>
                <Box boxShadow={'dark-xl'} bg="teal.50" p={3} borderRadius="md" className="top-stat-container">
                    <Heading as="h4" size="md">Buy Amount ({purchaseAmount} BNB):</Heading>
                    <br />
                    <Input placeholder={"Amount of BNB..."} onChange={(e) => setPurchaseAmountInput(e.target.value)} type={"number"}/>
                    <Button onClick={updatePurchaseAmount} mt={2} colorScheme="teal">Update</Button>
                </Box>
            </Box>
            {/*<Box className="new-coins-container" bg="teal.50" p={3} borderRadius={"md"}>*/}
            {/*    {*/}
            {/*        renderNewPairs()*/}
            {/*    }*/}
            {/*</Box>*/}
        </Box>
    )
}

export default Progress;