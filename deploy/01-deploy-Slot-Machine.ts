import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { verify } from '../utils/verify';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { ethers } from 'hardhat'
import { VRFCoordinatorV2Mock } from '../typechain-types';

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("1") 

export default async function deploySlotMachine({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment): Promise<void> {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!
  let vrfCoordinatorV2Address, subscriptionId: any, vrfCoordinatorV2Mock: VRFCoordinatorV2Mock 

  if(developmentChains.includes(network.name)){
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();
    const txResponse = await vrfCoordinatorV2Mock.createSubscription()
    const txReceipt = await txResponse.wait(1)
    //@ts-ignore
    subscriptionId = txReceipt!.logs[0].args.subId
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }

  const {keyHash, callbackGasLimit, minimumDeposit} = networkConfig[chainId]

  const args = [
    subscriptionId,
    vrfCoordinatorV2Address,
    callbackGasLimit,
    keyHash,
    minimumDeposit
  ];

  log("---------------------------------------------------------------------------------------------");
  log('Deploying SlotMachine and waiting for confirmations');
  const slotMachine = await deploy('SlotMachine', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1,
  });

  if(developmentChains.includes(network.name)) {
    //@ts-ignore
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, slotMachine.address)
    log('Consumer is added')
  }

  log(`SlotMachine deployed at ${slotMachine.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log('Verifying...');
    await verify(slotMachine.address, args);
  }
  log("---------------------------------------------------------------------------------------------");
}

deploySlotMachine.tags = ['all', 'slotMachine'];