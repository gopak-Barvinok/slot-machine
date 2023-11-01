import {run} from "hardhat";
import { waitTime } from "../scripts/waiting"

export const verify = async (contractAddress: string, args: any) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    }
    else if(e.message.toLowerCase().includes("try waiting for a minute")) {
      console.log("Bytecode is not already to loaded, try again...")
      await waitTime(1)
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      });
    }
    else {
      console.log(e);
    }
  }
};