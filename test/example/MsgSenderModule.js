const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('MsgSenderModule', function () {
  let msgSenderModule
  let owner
  let alice
  let bob
  let erc154InterfaceId

  before(async function () {
    [owner, alice, bob] = await ethers.getSigners()
    msgSenderModule = await ethers.deployContract('MsgSenderModule')
    erc154InterfaceId = '0x01ffc9a7'
  })

  it('should initialize with the expected message sender', async function () {
    const expectedMsgSender = alice.address
    await msgSenderModule.initialize(expectedMsgSender)

    expect(await msgSenderModule.expectedMsgSender()).to.equal(expectedMsgSender)
  })

  it('should support the IERC165 interface', async function () {
    const supportsIERC165 = await msgSenderModule.supportsInterface(erc154InterfaceId)
    expect(supportsIERC165).to.equal(true)
  })

  it('should run the module logic', async function () {
    const result = await msgSenderModule.run([erc154InterfaceId], alice.address)
    expect(result[0]).to.equal(erc154InterfaceId)
  })

  it('should not run the module logic if the msg.sender is incorrect', async function () {
    await expect(msgSenderModule.run([erc154InterfaceId], bob.address)).to.be.revertedWith(
      'Incorrect message sender'
    )
  })
})
