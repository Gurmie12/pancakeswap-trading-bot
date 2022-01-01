const express = require('express');
const bodyParser = require('body-parser')
const ethers = require('ethers');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const PORT = 8080;
const PORT2 = 8081;
const WS = '';
const addresses = {
    WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
}

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());
app.use(cors());

let FACTORY;
let ROUTER;
let PROVIDER;
let WALLET;
let ACCOUNT;
let WBNB;

app.use((req, res, next) =>{
    if((FACTORY && ROUTER && PROVIDER && WALLET && ACCOUNT && WBNB) || req.path === '/connect'){
        console.log(req.path);
        next();
    }else{
        res.status(500).json({status: 'error', message: 'You did not yet connect!'});
    }
});

app.get('/purchase', (req, res) =>{
    res.send('Hello World');
});

app.get('/balance', async(req, res) =>{
    const address = await WALLET.getAddress();
    const balance = await PROVIDER.getBalance(address);
    if(balance){
        res.json({status: 'success', data: {balance: ethers.utils.formatEther(balance)}});
    }else{
        res.json({status: 'error', message: 'something bad happend'});
    }
});

app.post('/connect', async(req, res) =>{
    const {phrase} = req.body;
    if(phrase){
        PROVIDER = new ethers.providers.WebSocketProvider(WS);
        WALLET = ethers.Wallet.fromMnemonic(phrase);
        ACCOUNT = WALLET.connect(PROVIDER);
        const address = await WALLET.getAddress();
        const balance = await PROVIDER.getBalance(address);

        FACTORY = new ethers.Contract(
            addresses.factory,
            ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
            ACCOUNT
        );

        ROUTER = new ethers.Contract(
            addresses.router,
            [
                'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
                'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
                'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
            ],
            ACCOUNT
        );

        WBNB = new ethers.Contract(
            addresses.WBNB,
            [
                'function approve(address spender, uint amount) public returns(bool)',
            ],
            ACCOUNT
        );

        WBNB.approve(addresses.router, balance.toString())
            .then(async(response) =>{
                const abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"]
                const contract_p = new ethers.Contract(addresses.WBNB, abi, ACCOUNT)
                await contract_p.approve(addresses.router, ethers.utils.parseUnits('1000.0', 18), {gasLimit: 100000, gasPrice: 5e9})
                res.json({status: 'success', data: {address, balance: ethers.utils.formatEther(balance)}});
            })
            .catch((err) =>{
                console.log(err);
                res.json({status: 'error', message: 'WBNB was not approved! please try again!'});
            })
    }else{
        res.json({status: 'error', message: 'No secret phase provided. Please try again!'});
    }
});

io.on('connection', (socket) =>{
    console.log('A user connected!')
});

const startPairFinding = () =>{
    FACTORY.on('PairCreated', async (tok1, tok2, pairAddress) =>{
        console.log("A new pair was created!")
        let tokIn, tokOut;
        if(tok1.toLowerCase() === addresses.WBNB.toLowerCase()){
            tokIn = tok1;
            tokOut = tok2;
        }else if(tok2.toLowerCase() === addresses.WBNB.toLowerCase()){
            tokIn = tok2;
            tokOut = tok1;
        }

        if(tokIn && tokOut){
            console.log(tokIn, tokOut);
            const buyAmount = ethers.utils.parseUnits('0.01', 'ether');
            ROUTER.getAmountsOut(buyAmount, [tokIn, tokOut])
                .then((amounts) =>{
                    // const minReceived = amounts[1].sub(amounts[1].div(3));
                    const minReceived = amounts[1].sub(amounts[1].mul(3).div(10));
                    io.emit("newPair", {tokOut, minReceived, tokIn, buyAmount});
                })
                .catch((err) =>{
                    console.log("Insuficient Liqudiity");
                })
        }
    })
}

app.get('/startPairFinding', (req, res) =>{
    if(FACTORY && ROUTER){
        startPairFinding();
        res.json({status: 'success', message: 'Pair finding started!'});
    }else{
        res.json({status: 'error', message: 'Pair finding not started!'});
    }
});

app.post('/buyToken', async (req, res) =>{
    const pair = req.body;
    const address = await WALLET.getAddress();
    ROUTER.swapExactTokensForTokens(
        pair.buyAmount,
        pair.minReceived,
        [pair.tokIn, pair.tokOut],
        address,
        Math.floor(Date.now() / 1000) + 60 * 3,
        {gasLimit: ethers.utils.hexlify(6000000), gasPrice: ethers.utils.parseUnits("10", "gwei")})
        .then((tx) =>{
            tx.wait()
                .then((receipt) =>{
                    console.log(receipt);
                    res.json({status: 'success', 'message': 'Bought!'});
                })
                .catch((err) =>{
                    console.log(err);
                    res.json({status: 'error', 'message': 'Not Bought!'});
                })
        })
        .catch((err) =>{
            console.log(err);
            res.json({status: 'error', 'message': 'Not Bought!'});
        })
})

app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`);
})

server.listen(PORT2);