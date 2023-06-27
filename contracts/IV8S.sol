// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IV8S {
    struct Project {
        string url;
    }

    struct Request {
        bytes data;
        uint256 projectId;
        bool hasResponse;
        bytes responseData;
    }

    function projects(uint projectId) external view returns (string memory);
    function addResponse(uint requestId, bytes memory responseData) external returns (uint);
    function getRequest(uint requestId) external view returns (uint256, bytes memory);
    function getUnrespondedRequests() external view returns (uint[] memory);
}
