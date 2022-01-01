import React from 'react';
import './App.css';
import {Box} from '@chakra-ui/react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/Profile/Profile";
import Progress from "./components/Progress/Progress";
import Calls from "./components/Calls/Calls";
import EthProvider from "./providers/EthProvider";

function App() {
    return (
        <Router>
            <EthProvider>
                <div className="app-container">
                    <Navbar />
                    <Box className="page-container" bg="teal.400" p={8}>
                        <Routes>
                            <Route exact path={"/"} element={<Progress />}/>
                            <Route path={"/calls"} element={<Calls />}/>
                            <Route path={"/profile"} element={<Profile />}/>
                        </Routes>
                    </Box>
                </div>
            </EthProvider>
        </Router>
    );
}

export default App;