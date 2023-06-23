const { ethers } = require("hardhat");
// const fetch = require('node-fetch');

const ca = require("../config/contractAddrs.json");

let contract;

const V8_URL = 'http://localhost:3000/run';

async function attach() {
  contract = await ethers.getContractAt("IV8S", ca.v8s);
}

async function getUnrespondedRequests() {
  const unrespondedRequests = await contract.getUnrespondedRequests();
  return unrespondedRequests;
}

async function getRequest(requestId) {
  const request = await contract.getRequest(requestId);
  const projectId = request[1];
  const url = await getProjectUrl(projectId);
  const inputParameters = hexStringToJson(request[0]);
  return { url, inputParameters };
}

async function getProjectUrl(projectId) {
  const url = await contract.projects(projectId);
  return url;
}

function hexStringToJson(hexString) {
  const bytes = [];

  for (let i = 2; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  const jsonString = new TextDecoder().decode(new Uint8Array(bytes));
  return JSON.parse(jsonString);
}

function jsonToHexString(jsonObject) {
  const jsonString = JSON.stringify(jsonObject);
  const byteArray = new TextEncoder().encode(jsonString);

  let hexString = "0x";
  for (let i = 0; i < byteArray.length; i++) {
    hexString += byteArray[i].toString(16).padStart(2, "0");
  }

  return hexString;
}

async function addResponse(requestId, responseData) {
  tx = await contract.addResponse(requestId, responseData);
  await tx.wait();

  return tx;
}

async function fetchRequest() {
  const unrespondedRequests = await getUnrespondedRequests();
  console.log(unrespondedRequests)

  for (let i = 0; i < unrespondedRequests.length; i++) {
    const unrespondedRequest = unrespondedRequests[i];
    const { url, inputParameters } = await getRequest(unrespondedRequest);
    console.log(url, inputParameters)

    if (unrespondedRequests.length > 0) {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          inputParameters: inputParameters
        })
      };

      const response = await fetch(V8_URL, options);
      let responseData = await response.json();

      responseData = jsonToHexString(responseData);

      await addResponse(unrespondedRequest, responseData);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await attach();

  while(true) {
    await fetchRequest();
    await sleep(5000); // Sleep for 5 seconds
  }
}

main();