const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery Contract", function () {
  
  // These are fixtures, setups task which will be run before every test
  async function deployLotteryFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Lottery");

    await hardhatToken.waitForDeployment();

    return { hardhatToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Validating the owner", async function() {
      const { hardhatToken, owner } = await loadFixture(deployLotteryFixture);
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Validating Ticket price and jackpot amount", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);
      expect(await ethers.provider.getBalance(hardhatToken)).to.equal(0);
    });
  });

  describe("Setting Ticket Price validations", function () {
    it("Validating the Set Ticket Price Function", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);
      expect(await hardhatToken.ticketPrice()).to.equal(ethers.parseEther("0.1"));

      await hardhatToken.connect(owner).setTicketPrice(1000);
      
      expect(await hardhatToken.ticketPrice()).to.equal(1000);
    });

    it("Non owner modifying ticket price", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);
      await expect(
          hardhatToken.connect(addr1).setTicketPrice(1000)
        ).to.be.revertedWith("Only the contract owner can call this method");
    });
  });

  describe("Setting Random Number validations", function () {
    it("Validating the Set Random Number Function", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);
      expect(await hardhatToken.randomRange()).to.equal(100000);

      await hardhatToken.connect(owner).setRandomRange(1000);
      
      expect(await hardhatToken.randomRange()).to.equal(1000);
    });

    it("Non owner modifying random range", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);
      await expect(
          hardhatToken.connect(addr1).setTicketPrice(1000)
        ).to.be.revertedWith("Only the contract owner can call this method");
    });
  });

  describe("Buying Tickets Tests", function () {
    it("Buying Ticket success case", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployLotteryFixture);
      await expect(
          hardhatToken.connect(addr1).buyTicket({ value: ethers.parseEther("0.1") })
        ).to.emit(hardhatToken, "Transfer");
      expect (await ethers.provider.getBalance(hardhatToken)).to.equal(ethers.parseEther("0.1"));
    });

    it("Buying Ticket incorrect ticket amount sent", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployLotteryFixture);
      await expect(
          hardhatToken.connect(addr1).buyTicket({ value: ethers.parseEther("1") })
        ).to.be.revertedWith("Incorrect ticket amount sent");
    });

    it("Buying Ticket with insufficient balance", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployLotteryFixture);
      
      // Setting a very high ticket price so that the balance criteria isn't met
      await hardhatToken.connect(owner).setTicketPrice(ethers.parseEther("100000"));
      
      await expect(
          hardhatToken.connect(addr1).buyTicket({ value: ethers.parseEther("1") })
        ).to.be.revertedWith("Not enough tokens to buy the ticket");
    });
  });

  describe("Play Lottery Tests", function () {
    it("Validating success case", async function() {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployLotteryFixture);

      // Setting the random value to 1 so that we win every time, this is only for test
      await hardhatToken.connect(owner).setRandomRange(0);

      let jackpotBeforeTicket = ethers.formatEther(await ethers.provider.getBalance(hardhatToken));
      expect(jackpotBeforeTicket).to.equal("0.0");

      let addr1InitialBalance = ethers.formatEther(await ethers.provider.getBalance(addr1));
      expect(addr1InitialBalance).to.equal("10000.0");

      // Buying a ticket
      await expect(
        hardhatToken.connect(addr1).buyTicket({ value: ethers.parseEther("0.1") })
      ).to.emit(hardhatToken, "Transfer");

      let jackpotAfterTikcet = ethers.formatEther(await ethers.provider.getBalance(hardhatToken));
      expect(jackpotAfterTikcet).to.equal("0.1");

      await expect(
        hardhatToken.connect(addr1).play()
      ).to.emit(hardhatToken, "Won");

      let jackpotBalanceAfterWinning = ethers.formatEther(await ethers.provider.getBalance(hardhatToken));
      expect(jackpotBalanceAfterWinning).to.equal("0.0");

      let addr1BalanceAfterWinning = ethers.formatEther(await ethers.provider.getBalance(addr1));
      expect(addr1BalanceAfterWinning).to.equal("9999.999853896055358371");
    });

    it("Play without buying a ticket", async function() {
      const {hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);

      await expect(hardhatToken.connect(addr1).play()).to.be.revertedWith("User doesn't have a ticket");
    });

    it("Losing case", async function() {
      const {hardhatToken, owner, addr1 } = await loadFixture(deployLotteryFixture);

      await expect(
        hardhatToken.connect(addr1).buyTicket({ value: ethers.parseEther("0.1") })
      ).to.emit(hardhatToken, "Transfer");
      
      await expect(
        hardhatToken.connect(addr1).play()
      ).to.emit(hardhatToken, "Lost");
    });

  });
});
