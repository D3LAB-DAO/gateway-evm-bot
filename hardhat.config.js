require("@nomicfoundation/hardhat-toolbox");
const pk = require("./config/bot.json").pk;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.testnet.fantom.network/",
      }
    },
    tftm: {
      url: "https://rpc.testnet.fantom.network/",
      accounts: [pk],
    }
  }
};
