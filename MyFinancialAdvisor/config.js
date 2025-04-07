import * as Network from 'expo-network';

const getLocalIP = async () => {
  try {
    //const ip = await Network.getIpAddressAsync();
    const ip = '192.168.18.12';
    return `http://${ip}:5005`; // Adjust port if needed
  } catch (error) {
    console.error("Error getting IP address:", error);
    return "http://localhost:5005"; // Fallback
  }
};

export default getLocalIP;
