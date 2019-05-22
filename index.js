const mqttusvc = require("mqtt-usvc");
const path = require("path");

const service = mqttusvc.create({
  configPath: path.join(__dirname, "/config.yml")
});

const zway = require("./zway").create(service.config);

zway.onAlarm(details => {
  const payload = Object.assign(details, { timestamp: new Date() });
  service.send("status/" + details.device + "/alarm", payload);
  service.send(
    "status/" + details.device + "/alarm/" + details.alarmType,
    payload
  );
});

zway.onMode(details => {
  const payload = {
    data: details.value,
    locked: Boolean(details.value),
    timestamp: new Date()
  };
  service.send("status/" + details.device + "/mode", payload);
  service.send("status/" + details.device + "/mode/" + details.value, payload);
});

service.on("message", (topic, data) => {
  const [set, device, action] = topic.split("/");

  if (set !== "set") return;

  switch (action) {
    case "activate":
      console.log(JSON.stringify(data));
      if (data) {
        zway.lock(device);
      } else {
        zway.unlock(device);
      }
      break;
    case "lock":
      zway.lock(device);
      break;
    case "unlock":
      zway.unlock(device);
      break;
  }
});
