function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitTime(minutes: number) {
  const milliseconds = minutes * 60 * 1000; 
  await sleep(milliseconds);
  console.log(`Wait ${minutes} minutes.`);
}
