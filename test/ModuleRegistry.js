const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('ModuleRegistry', function () {
  let moduleRegistry
  let correctModule

  before(async function () {
    moduleRegistry = await ethers.deployContract('ModuleRegistry')
    correctModule = await ethers.deployContract('CorrectModule')
  })

  it('should register a new module', async function () {
    const name = 'SampleModule'
    const description = 'A sample module for testing'
    const moduleAddress = correctModule.target

    await moduleRegistry.register(name, description, moduleAddress)

    const registeredModule = await moduleRegistry.modules(moduleAddress)
    expect(registeredModule.name).to.equal(name)
    expect(registeredModule.description).to.equal(description)
    expect(registeredModule.moduleAddress).to.equal(moduleAddress)
  })

  it('should not register a module with missing name', async function () {
    const description = 'A sample module for testing'
    const moduleAddress = correctModule.target

    await expect(
      moduleRegistry.register('', description, moduleAddress)
    ).to.be.revertedWithCustomError(moduleRegistry, 'ModuleNameMissing')
  })

  it('should not register a module with invalid address', async function () {
    const name = 'SampleModule'
    const description = 'A sample module for testing'

    await expect(
      moduleRegistry.register(name, description, ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(moduleRegistry, 'ModuleAddressInvalid')
  })

  it('should not register a module without AbstractModule interface', async function () {
    const name = 'SampleModule'
    const description = 'A sample module for testing'
    const incorrectModule = await ethers.deployContract('IncorrectModule')

    await expect(
      moduleRegistry.register(name, description, incorrectModule.target)
    ).to.be.revertedWithCustomError(moduleRegistry, 'ModuleInvalid')
  })

  it('should not register an already existing module', async function () {
    const name = 'SampleModule'
    const description = 'A sample module for testing'
    const moduleAddress = correctModule.target

    await expect(
      moduleRegistry.register(name, description, moduleAddress)
    ).to.be.revertedWithCustomError(moduleRegistry, 'ModuleAlreadyExists')
  })

  it('should return the number of registered modules', async function () {
    const count = await moduleRegistry.getModulesNumber()
    expect(count).to.equal(1)
  })

  it('should confirm that a module is registered', async function () {
    const result = await moduleRegistry.isRegistered(correctModule.target)
    expect(result).to.equal(true)
  })

  it('should run a chain of modules', async function () {
    await moduleRegistry.runModules([correctModule.target], ['0xab'])
  })

  it('should not run a module that is not registered', async function () {
    await expect(
      moduleRegistry.runModules([moduleRegistry.target], ['0xab'])
    ).to.be.revertedWithCustomError(moduleRegistry, 'ModuleNotRegistered')
  })
})
