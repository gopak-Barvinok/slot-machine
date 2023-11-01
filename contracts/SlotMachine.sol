// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract SlotMachine is VRFConsumerBaseV2, ConfirmedOwner {

    event GameOver(bool win, uint256 winnings);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    enum Game {
        START,
        CALCULATING,
        STOP
    }

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256 randomWord;
    }

    mapping(uint256 => RequestStatus) public s_requests;
    mapping(address => uint256) public users;
    mapping(address => Game) public userStatusGame;

    VRFCoordinatorV2Interface COORDINATOR;

    bytes32 keyHash;

    uint256[] public requestIds;
    uint256 public lastRequestId;
    uint256 public totalAmount;
    uint256 public minimumDeposit;
    
    uint64 s_subscriptionId;

    uint32 callbackGasLimit;

    uint16 requestConfirmations = 3;
    uint16 numWords = 1;

    Game public statusGame;

    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinatorV2Interface,
        uint32 _callbackGasLimit,
        bytes32 _keyHash,
        uint256 _minimumDeposit
    ) 
    VRFConsumerBaseV2(_vrfCoordinatorV2Interface)
    ConfirmedOwner(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinatorV2Interface);
        s_subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        keyHash = _keyHash;
        minimumDeposit = _minimumDeposit;
    }

    modifier checkLiquidity() {
        require(address(this).balance >= minimumDeposit * 30, "not enough liquidity");
        _;
    }

    function inputDeposit() external payable checkLiquidity {
        require(msg.value >= minimumDeposit, "not enough deposit");
        users[msg.sender] = msg.value;
        totalAmount += msg.value;
        userStatusGame[msg.sender] = Game.START;
    }

    function setMinimumDeposit(uint256 _min) external onlyOwner {
        minimumDeposit = _min;
    }

    function setCallbackGasLimit(uint32 _amount) public onlyOwner {
        callbackGasLimit = _amount;
    }

    function calculatePrize(uint256 _rand) private view returns(bool successs, uint256 prize) {
        require(userStatusGame[msg.sender] == Game.CALCULATING, "User not in game");
        if(
            _rand % 5 == 0
            &&
            _rand % 5 == 0
            &&
            _rand % 5 == 0
        ) {
            return (true, users[msg.sender] * 30);
        } else if (
            _rand % 6 == 0
            &&
            _rand % 5 == 0
            &&
            _rand % 6 == 0
        ) {
            return (true, users[msg.sender] * 20);
        } else if (
            _rand % 4 == 0
            &&
            _rand % 4 == 0
            &&
            _rand % 4 == 0
        ) {
            return (true, users[msg.sender] * 10);
        } else if (
            _rand % 3 == 0
            &&
            _rand % 3 == 0
            &&
            _rand % 3 == 0
        ) {
            return (true, users[msg.sender] * 5);
        } else if (
            _rand % 2 == 0
            &&
            _rand % 2 == 0
            &&
            _rand % 2 == 0
        ) {

        } else {
            return (false, 0);
        }
    }

    function requestRandomWords() public checkLiquidity returns(uint256 requestId) {
        require(userStatusGame[msg.sender] == Game.START, "User not in game");
        userStatusGame[msg.sender] = Game.CALCULATING;
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requests[requestId] = RequestStatus({
            randomWord: uint256(0),
            exists: true,
            fulfilled: false
        });

        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

   function fulfillRandomWords(
        uint256 _randomWord,
        uint256[] memory
    ) internal override {
        userStatusGame[msg.sender] = Game.STOP;
       (bool successs, uint256 prize) = calculatePrize(_randomWord);
        if(successs) {
            (bool success, ) = msg.sender.call{value: prize}(""); 
            require(success, "Failed to send Ether");
        }
        delete users[msg.sender];
        emit GameOver(successs, prize);

    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns(bool fulfilled, uint256 randomWord) {
        require(userStatusGame[msg.sender] == Game.CALCULATING, "User not in game");
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return(request.fulfilled, request.randomWord);       
    }

    receive() external payable {

    }
}
