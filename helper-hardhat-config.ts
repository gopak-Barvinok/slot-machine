export interface NetworkConfig {
    [key: number]: {
      name: string;
      subscriptionId: number | null
      vrfCoordinatorV2: string | null
      callbackGasLimit: number,
      keyHash: string,
      minimumDeposit: number
    //   verifier: string;
    };
}

export const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
        subscriptionId: 6558,
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        callbackGasLimit: 2500000,
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        minimumDeposit: 500
    },
    31337: {
        name: "hardhat",
        subscriptionId: null,
        vrfCoordinatorV2: null,
        callbackGasLimit: 2500000,
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        minimumDeposit: 500
    }
}

export const developmentChains = ["hardhat", "localhost"]