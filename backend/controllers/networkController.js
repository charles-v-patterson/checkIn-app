const { lookup } = require("dns");
const { mask } = require("ip");
const { promisify } = require("util");
//const { parseCIDR } = require('ip');
const dnsLookup = promisify(lookup);

const isOnNetwork = async (userIPAddress, networkCIDR) => {
  try {
    const userIPInfo = await dnsLookup(userIPAddress);
    const userIP = userIPInfo.address;
    const networkAddress = parseCIDRForAddress(networkCIDR);
    const subnetMask = parseCIDRForMask(networkCIDR);
    const networkStart = networkAddress;
    const networkEnd = calculateNetworkEnd(networkAddress, subnetMask);
    const userIPNumeric = ipToNumeric(userIP);
    const networkStartNumeric = ipToNumeric(networkStart);
    const networkEndNumeric = ipToNumeric(networkEnd);

    if (
      userIPNumeric >= networkStartNumeric &&
      userIPNumeric <= networkEndNumeric
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

const parseCIDRForAddress = function (CIDR) {
  var address = CIDR.substring(CIDR, CIDR.indexOf("/"));

  return address;
};

const parseCIDRForMask = function (CIDR) {
  var maskInt = CIDR.substring(CIDR.indexOf("/") + 1);
  var octets = [0, 0, 0, 0];

  // calculate value of each octet
  for (var i = 0; i < 4; i++) {
    if (maskInt >= 8) {
      octets[i] = 255;
      maskInt -= 8;
    } else {
      octets[i] = 256 - Math.pow(2, 8 - maskInt);
      maskInt = 0;
    }
  }

  return octets.join(".");
};

const calculateNetworkEnd = (networkAddress, subnetMask) => {
  const networkAddressNumeric = ipToNumeric(networkAddress);
  const subnetMaskNumeric = ipToNumeric(subnetMask);
  const networkEndNumeric = networkAddressNumeric | ~subnetMaskNumeric;
  return numericToIp(networkEndNumeric);
};

const ipToNumeric = (ip) => {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
};

const numericToIp = (numeric) => {
  return (
    (numeric >>> 24) +
    "." +
    ((numeric >> 16) & 255) +
    "." +
    ((numeric >> 8) & 255) +
    "." +
    (numeric & 255)
  );
};

module.exports = {
  isOnNetwork,
};
