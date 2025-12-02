import { UAParser } from "ua-parser-js";
import Cookies from "js-cookie";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";


const generateMachineId = () => {
  try {
    return uuidv4();
  } catch (err) {
    console.error("Machine ID generation failed:", err);
    return "unknown-machine-id";
  }
};


const getGeolocation = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;


        Cookies.set("__lat", String(latitude));
        Cookies.set("__long", String(longitude));
        Cookies.set("__accuracy", String(accuracy));

        resolve({ latitude, longitude, accuracy });
      },
      (err) => {
        console.warn(
          `Geolocation error (code ${err.code}): ${err.message}`
        );
        reject(err);
      },
      { timeout: 10000 }
    );
  });

const fetchIPData = async () => {
  try {

    const response = await fetch("https://api.ipify.org/?format=json");

    if (!response.ok) {
      throw new Error(`IP API failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ip) {
      throw new Error("Invalid IP response");
    }

    const userIP = data.ip;


    Cookies.set("ipaddress", userIP);
    axios.defaults.headers.common["ipaddress"] = userIP;


    let machineId = Cookies.get("machineid");

    if (!machineId) {
      machineId = generateMachineId(userIP);
      Cookies.set("machineid", machineId);
    }

    axios.defaults.headers.common["machineid"] = machineId;


    let geoLocation = null;
    try {
      geoLocation = await getGeolocation();

      axios.defaults.headers.common["latitude"] = geoLocation.latitude;
      axios.defaults.headers.common["longitude"] = geoLocation.longitude;
      axios.defaults.headers.common["accuracy"] = geoLocation.accuracy;
    } catch (geoErr) {
      console.warn("Geolocation unavailable:", geoErr.message);
      geoLocation = {
        latitude: null,
        longitude: null,
        accuracy: null,
      };
    }

    return { ip: userIP, geoLocation };
  } catch (err) {
    console.error("Error in fetchIPData:", err);

    return {
      ip: null,
      geoLocation: null,
      error: err.message,
    };
  }
};


const getBrowserDetails = () => {
  try {
    const parser = new UAParser();
    return parser.getResult();
  } catch (err) {
    console.error("UAParser error:", err);
    return {};
  }
};

export { getGeolocation, fetchIPData, getBrowserDetails };
