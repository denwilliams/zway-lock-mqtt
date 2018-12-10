# zway-lock-mqtt

MQTT API for lock control of Z-Wave lock using a ZWay controller

## Lock Mode

- 0x00 Door Unsecured (Open).
- 0x01 Door Unsecured with timeout.
- 0x10 Door Unsecured for inside Door Handles.
- 0x11 Door Unsecured for inside Door Handles with timeout.
- 0x20 Door Unsecured for outside Door Handles.
- 0x21 Door Unsecured for outside Door Handles with timeout.
- 0xFE Door/Lock Mode Unknown (bolt not fully retracted/engaged).
- 0xFF Door Secured (closed).

## 8.27 Command Class Door Lock Logging (0x4C/76)

Allows to receive reports about all successful and failed activities of the electronic door lock.
Event types are the following:.

- 1 Lock Command: Keypad access code verified lock command.
- 2 Unlock Command: Keypad access code verified unlock command.
- 3 Lock Command: Keypad lock button pressed.
- 4 Unlock command: Keypad unlock button pressed.
- 5 Lock Command: Keypad access code out of schedule.
- 6 Unlock Command: Keypad access code out of schedule.
- 7 Keypad illegal access code entered.
- 8 Key or latch operation locked (manual).
- 9 Key or latch operation unlocked (manual).
- 10 Auto lock operation.
- 11 Auto unlock operation.
- 12 Lock Command: Z-Wave access code verified.
- 13 Unlock Command: Z-Wave access code verified.
- 14 Lock Command: Z-Wave (no code).
- 15 Unlock Command: Z-Wave (no code).
- 16 Lock Command: Z-Wave access code out of schedule.
- 17 Unlock Command Z-Wave access code out of schedule.
- 18 Z-Wave illegal access code entered.
- 19 Key or latch operation locked (manual).
- 20 Key or latch operation unlocked (manual).
- 21 Lock secured.
- 22 Lock unsecured.
- 23 User code added.
- 24 User code deleted.
- 25 All user codes deleted.
- 26 Master code changed.
- 27 User code changed.
- 28 Lock reset
- 29 Configuration changed.
- 30 Low battery.
- 31 New Battery installed

```js
    case 9:
      major = 'Deadbolt';
      minor = 'jammed';
      break;
    case 18:
      major = 'Locked with code';
      minor = 'by user ' + (eventData.level + 1);
      break;
    case 19:
      major = 'Unlocked with code';
      minor = 'by user ' + (eventData.level + 1);
      break;
    case 21:
      major = 'Manually locked';
      switch (eventData.level) {
        case 1:
          minor = 'by thumb turn or key';
          break;
        case 2:
          minor = 'by outside pad';
          break;
        default:
          minor = 'by ' + eventData.level;
          break;
      }
      break;
    case 22:
      major = 'Manually unlocked';
      switch (eventData.level) {
        case 1:
          minor = 'by thumb turn or key';
          break;
        default:
          minor = 'by ' + eventData.level;
          break;
      }
      break;
    case 24:
      major = 'Locked via software';
      switch (eventData.level) {
        case 1:
          minor = 'by RF module';
          break;
        default:
          minor = 'by ' + eventData.level;
          break;
      }
      break;
    case 25:
      major = 'Unlocked via software';
      switch (eventData.level) {
        case 1:
          minor = 'by RF module';
          break;
        default:
          minor = 'by ' + eventData.level;
          break;
      }
      break;
    case 25:
      major = 'Lock automatically';
      switch (eventData.level) {
        case 1:
          minor = 'locked';
          break;
        default:
          minor = eventData.level;
          break;
      }
      break;
    case 33:
      major = 'Deleted user';
      minor = eventData.level;
      break;
    case 112:
      major = 'Added or updated user';
      minor = eventData.level;
      break;
    case 113:
      major = 'Duplicate code for user';
      minor = eventData.level;
      break;
    case 130:
      major = 'RF module power';
      minor = 'cycled';
      break;
    case 161:
      major = 'Tamper alarm -';
      switch (eventData.level) {
        case 1:
          minor = 'keypad attempts exceed code entry limit';
          break;
        case 2:
          minor = 'front escutcheon removed from main';
          break;
        default:
          minor = eventData.level;
          break;
      }
      break;
    case 167:
      major = 'Low';
      minor = 'battery';
      break;
    case 168:
      major = 'Critical';
      minor = 'battery';
      break;
    case 169:
      major = 'Insufficient';
      minor = 'battery';
      break;
    default:
      major = eventData.alarmType + ' :';
      minor = eventData.level;
```
