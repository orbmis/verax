// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { Attestation, AttestationPayload } from "../types/Structs.sol";

//TODO: Add hooks with basic implementation
abstract contract AbstractPortal {
  function attest(
    AttestationPayload memory attestationPayload,
    bytes[] memory validationPayload
  ) external payable virtual;

  function getModules() external virtual returns (address[] memory);
  function revoke(bytes32 attesttationId) external virtual returns (bool);
}
