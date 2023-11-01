import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains} from '../helper-hardhat-config';
import { ethers } from 'hardhat'

const BASE_FEE = ethers.parseEther("0.25")
const GAS_PIRCE_LINK = 1e9;

export default async function deployMocks({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment): Promise<void> {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const args = [BASE_FEE, GAS_PIRCE_LINK];

    if(developmentChains.includes(network.name)) {
        log("---------------------------------------------------------------------------------------------")
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args
        })
        log("Mocks deployed!")
        log("---------------------------------------------------------------------------------------------")
    }
}

deployMocks.tags = ['all', 'mocks'];