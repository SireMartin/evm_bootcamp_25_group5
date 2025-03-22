    for(let i = await publicClient.getBlockNumber() - 1n; i > 0; --i)
    {
        console.log(`voting power for deployer was ${await tokenContract.read.getPastVotes([deployer.account.address, i])}`)
    }

    await tokenContract.write.delegate([deployer.account.address]);
    console.log(`voting power for deployer is ${await tokenContract.read.getVotes([deployer.account.address])}`);

    await tokenContract.write.mint([deployer.account.address, parseEther("5")]); //me
    await tokenContract.write.mint([deployer.account.address, parseEther("5")]); //me
    await tokenContract.write.mint([deployer.account.address, parseEther("5")]); //me

    for(let i = await publicClient.getBlockNumber() - 1n; i > 0; --i)
    {
        console.log(`voting power for deployer was ${await tokenContract.read.getPastVotes([deployer.account.address, i])}`)
    }

    const balanceOfDeployerBeforeTransfer = await tokenContract.read.balanceOf([deployer.account.address]);
    console.log(`balance deployer after minting is ${formatEther(balanceOfDeployerBeforeTransfer)}`);
    await tokenContract.write.transfer(["0x81D51adbC06827784cE72184Fce6861FFF31D16C", parseEther("1")], {account: deployer.account.address});
    const balanceOfTrust = await tokenContract.read.balanceOf(["0x81D51adbC06827784cE72184Fce6861FFF31D16C"]);
    console.log(`balance trust after transfer is ${formatEther(balanceOfTrust)}`);
    const balanceOfDeployerAfterTransfer = await tokenContract.read.balanceOf([deployer.account.address]);
    console.log(`balance deployer after transfer is ${formatEther(balanceOfDeployerAfterTransfer)}`);