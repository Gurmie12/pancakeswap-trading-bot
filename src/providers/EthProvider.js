import React, {createContext, useEffect, useState} from 'react';
import API from "../clients/api.js";

const defaultState = {
    address: null,
    balance: 0,
    purchased: [],
    autoBuyToggled: false,
    connected: false
}

export const EthContext = createContext(defaultState);

const EthProvider = ({children}) =>{
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(0);
    const [autoBuyToggled, setAutoBuyToggled] = useState(false);
    const [purchased, setPurchased] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() =>{
        if(address){
            API.get('/balance')
                .then((res) =>{
                    if(res.data.status === 'success'){
                        setBalance(res.data.data.balance);
                    }else{
                        console.log('There was a problem!');
                    }
                })
                .catch((err) =>{
                    console.log(err);
                })
        }
    }, [purchased, address])


    return <EthContext.Provider value={{address, setAddress, balance, setBalance, autoBuyToggled, setAutoBuyToggled, purchased, setPurchased, connected, setConnected}}>{children}</EthContext.Provider>
}

export default EthProvider;

