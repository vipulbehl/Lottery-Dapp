// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "hardhat/console.sol";

contract Lottery {
    address public owner;
    uint256 public jackpotAmount = 0;
    uint256 public ticketPrice = 100000000000000000; // Amount in wei equivalent to 0.1 ETH
    mapping(address => uint256) userAddressTicketMap;

     event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the contract owner can call this method");
        _;
    }

    /**
     * This function is used to set the ticket price, this can only be set by the contract owner
     * @param price The new price for the ticket
     */
    function setTicketPrice(uint256 price) public onlyOwner {
        ticketPrice = price;
    }

    /**
     * Deducts the ticketPrice from user's account
     * Transfers money to contract
     * Generate a random ticket for the user
     * Returns the generated ticket
     */
    function buyTicket() external payable returns (uint256) {
        require(msg.sender.balance >= ticketPrice, "Not enough tokens to buy the ticket");
        require(msg.value == ticketPrice, "Incorrect ticket amount sent");
        
        payable(msg.sender);
        emit Transfer(msg.sender, address(this), ticketPrice);
        
        jackpotAmount += ticketPrice;

        uint256 ticketNumber = generateRandomNumber();
        userAddressTicketMap[msg.sender] = ticketNumber;

        return ticketNumber;
    }

    /**
     * Generates the winning number 
     * Checks if the assigned ticket is the same as the jackpot number
     * Transfers the jackpot amount to the user if he/she hit the jackpot
     * Resets the user's ticket number to 0
     */
    function play() external payable returns (uint256) {
        uint256 ticketNumber = userAddressTicketMap[msg.sender];
        require(ticketNumber != 0, "User doesn't have a ticket");

        uint256 jackpotNumber = generateRandomNumber();
        
        if (ticketNumber == jackpotNumber) {
            payable(msg.sender).transfer(jackpotAmount);
            emit Transfer(owner, msg.sender, jackpotAmount);
            jackpotAmount = 0;
        }
        
        // Resetting user's ticket
        userAddressTicketMap[msg.sender] = 0;
        return jackpotNumber;
    }

    function generateRandomNumber() private view returns (uint256) {
        uint256 blockValue = uint256(blockhash(block.number - 1)); // Use the previous block's hash
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, blockValue, owner)));
        
        return (randomNum % 100000) + 1; // Get a random number between 1 and 100000
    }
}
