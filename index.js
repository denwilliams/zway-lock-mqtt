const mqttusvc = require("mqtt-usvc");
const path = require("path");

const service = mqttusvc.create({
  configPath: path.join(__dirname, "/config.yml")
});

const zway = require("./zway").create(service.config);

zway.onAlarm(details => {
  service.send("status/" + details.device + "/alarm", details);
  service.send(
    "status/" + details.device + "/alarm/" + details.alarmType,
    details
  );
});

zway.onMode(details => {
  service.send("status/" + details.device + "/mode", {
    data: details.value,
    locked: Boolean(details.value)
  });
  service.send("status/" + details.device + "/mode/" + details.value, {
    data: details.value,
    locked: Boolean(details.value)
  });
});

service.on("message", (topic, data) => {
  const [set, device, action] = topic.split("/");

  if (set !== "set") return;

  switch (action) {
    case "lock":
      zway.lock(device);
      break;
    case "unlock":
      zway.unlock(device);
      break;
  }
});
