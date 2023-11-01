// import { loadFixture }  from "@nomicfoundation/hardhat-network-helpers";
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { expect, assert } from "chai";
import { getNamedAccounts, deployments, ethers, network } from 'hardhat';
import { SlotMachine, VRFCoordinatorV2Mock } from "../typechain-types";
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

!developmentChains.includes(network.name) 
? describe.skip 
: describe("SlotMachine Contract", () => {
    let slotMachine: SlotMachine, vrfCoordinatorV2Mock: VRFCoordinatorV2Mock, deployer, user: HardhatEthersSigner

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"])
        slotMachine = await ethers.getContract("SlotMachine", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        [user] = await ethers.getSigners();
    })   

    describe("Start game", () => {
        it("Should be correct deposite", async () => {
            const [_, funder] = await ethers.getSigners();
            const liquidity = ethers.parseEther("1");
            await funder.sendTransaction({to: slotMachine, value: liquidity});

            const value = 600
            const txDeposite = await slotMachine.connect(user).inputDeposit({value: value});
            await txDeposite.wait(1);
            const contractBalance = await slotMachine.totalAmount()
            assert.equal(contractBalance.toString(), value.toString());
        })

        it("Should be reverted with low liquidity", async () => {
            const value = 600
            await expect(slotMachine.inputDeposit({value: value})).to.be.revertedWith("not enough liquidity");
        })

        it("should be returned request id", async () => {
            const [_, funder] = await ethers.getSigners();
            const liquidity = ethers.parseEther("1");
            await funder.sendTransaction({to: slotMachine, value: liquidity});

            const value = 600
            const txDeposit = await slotMachine.connect(user).inputDeposit({value: value});
            await txDeposit.wait(1);
            const txRequestId = await slotMachine.connect(user).requestRandomWords();
            txRequestId.wait(1)

            expect(await slotMachine.lastRequestId()).to.be.exist;
        })

        it("Should be returned randomWord", async () => {
            const [_, funder] = await ethers.getSigners();
            const liquidity = ethers.parseEther("1");
            await funder.sendTransaction({to: slotMachine, value: liquidity});

            const value = 600
            const txDeposit = await slotMachine.connect(user).inputDeposit({value: value});
            await txDeposit.wait(1);
            const txRequestId = await slotMachine.connect(user).requestRandomWords();
            txRequestId.wait(1)

            await network.provider.request({method: "evm_mine", params: []})

            const requestId = await slotMachine.lastRequestId();

            const getRandomWords = await slotMachine.getRequestStatus(requestId);
            console.log(getRandomWords);
        })
    })
})