const zway = require("node-zway");
const { EventEmitter } = require("events");

function getMajorMinor(eventData) {
  let major, minor;
  switch (eventData.alarmType) {
    case 9:
      major = "Deadbolt";
      minor = "jammed";
      break;
    case 18:
      major = "Locked with code";
      minor = "by user " + (eventData.level + 1);
      break;
    case 19:
      major = "Unlocked with code";
      minor = "by user " + (eventData.level + 1);
      break;
    case 21:
      major = "Manually locked";
      switch (eventData.level) {
        case 1:
          minor = "by thumb turn or key";
          break;
        case 2:
          minor = "by outside pad";
          break;
        default:
          minor = "by " + eventData.level;
          break;
      }
      break;
    case 22:
      major = "Manually unlocked";
      switch (eventData.level) {
        case 1:
          minor = "by thumb turn or key";
          break;
        default:
          minor = "by " + eventData.level;
          break;
      }
      break;
    case 24:
      major = "Locked via software";
      switch (eventData.level) {
        case 1:
          minor = "by RF module";
          break;
        default:
          minor = "by " + eventData.level;
          break;
      }
      break;
    case 25:
      major = "Unlocked via software";
      switch (eventData.level) {
        case 1:
          minor = "by RF module";
          break;
        default:
          minor = "by " + eventData.level;
          break;
      }
      break;
    case 25:
      major = "Lock automatically";
      switch (eventData.level) {
        case 1:
          minor = "locked";
          break;
        default:
          minor = eventData.level;
          break;
      }
      break;
    case 33:
      major = "Deleted user";
      minor = eventData.level;
      break;
    case 112:
      major = "Added or updated user";
      minor = eventData.level;
      break;
    case 113:
      major = "Duplicate code for user";
      minor = eventData.level;
      break;
    case 130:
      major = "RF module power";
      minor = "cycled";
      break;
    case 161:
      major = "Tamper alarm -";
      switch (eventData.level) {
        case 1:
          minor = "keypad attempts exceed code entry limit";
          break;
        case 2:
          minor = "front escutcheon removed from main";
          break;
        default:
          minor = eventData.level;
          break;
      }
      break;
    case 167:
      major = "Low";
      minor = "battery";
      break;
    case 168:
      major = "Critical";
      minor = "battery";
      break;
    case 169:
      major = "Insufficient";
      minor = "battery";
      break;
    default:
      major = eventData.alarmType + " :";
      minor = eventData.level;
  }
  return { major, minor };
}

exports.create = config => {
  const { host, user, password, devices } = config;
  const e = new EventEmitter();

  var deviceApi = new zway.DeviceApi({
    host,
    user,
    password
  });

  deviceApi.refresh().then(() => {
    console.log("Ready!");
  });

  deviceApi.poll(1000);

  function emitBattery() {
    devices.forEach(d => {
      const device = deviceApi.getDevice(d, 128);
      e.emit("battery", {
        value: parseFloat(device.Battery.get("last")),
        device: d
      });
    });
  }

  // There would be another way to get this on update,
  // this hack will do for now. Emit every hour.
  setInterval(emitBattery, 60 * 60 * 1000);

  devices.forEach(d => {
    // deviceApi.on(d, "*", "*", data => {
    //   console.log("event data:", JSON.stringify(data));
    //   // e.emit("update", key, data);
    // });
    deviceApi.on(d, 113, "V1event", data => {
      const { alarmType, level } = data.data;
      const { major, minor } = getMajorMinor(data.data);
      // console.log(`EVENT ${data.device} ${JSON.stringify(details)}`);
      e.emit("alarm", { major, minor, alarmType, level, device: data.device });

      // Bit of an unelegant way to do this, but data seems to stay stale
      // for a long while after the alarm is received. Get seems to fix it.
      // Maybe want to debounce this.
      const device = deviceApi.getDevice(d, 98);
      device.refresh();
    });

    deviceApi.on(d, 98, "mode", data => {
      e.emit("mode", { value: data.data, device: data.device });
    });

    deviceApi.on(d, 98, "insideMode", data => {
      e.emit("insideMode", { value: data.datas, device: data.device });
    });

    deviceApi.on(d, 98, "outsideMode", data => {
      e.emit("outsideMode", { value: data.datas, device: data.device });
    });
  });

  // deviceApi.onAny((path, data) => {
  //   console.log("event data:", JSON.stringify(data));
  //   // e.emit("update", path, data);
  // });

  // deviceApi.on("5.98.*", data => {
  //   console.log("event data:", data);
  // });

  return {
    lock(deviceId) {
      var device = deviceApi.getDevice(deviceId, 98);
      device.DoorLock.lock();
    },
    unlock(deviceId) {
      var device = deviceApi.getDevice(deviceId, 98);
      device.DoorLock.unlock();
    },
    isLocked(deviceId) {
      var device = deviceApi.getDevice(deviceId, 98);
      // return device.DoorLock.get("mode");
      return device.DoorLock.isLocked();
    },
    // onAny: e.onAny.bind(e),
    onAlarm(fn) {
      e.on("alarm", fn);
    },
    onMode(fn) {
      e.on("mode", fn);
    },
    onBattery(fn) {
      e.on("battery", fn);
    }
    // removeListener: e.removeListener.bind(e)
  };
};
