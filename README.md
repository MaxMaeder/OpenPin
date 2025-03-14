# OpenPin

A fix for the disabled Humane AI Pins. Very basic / buggy right now!

## Installing/Running

1. Get ADB access

2. Configure AI Pin

Connect to WiFi:

```bash
adb shell am start -a android.settings.SETTINGS
```

> Above opens phone settings, then configure WiFi like any Android phone.

Disable Humane services:

```bash
adb shell pm disable-user --user 0 hu.ma.ne.ironman
```

_If you ever want to re-enable_:

```bash
adb shell pm enable --user 0 hu.ma.ne.ironman
```

3. Compile and install daemon

From inside `daemon` folder:

```bash
./gradlew build
adb push build/bin/native/debugExecutable/daemon.kexe /data/local/tmp/daemon
adb shell 'nohup /data/local/tmp/daemon > /dev/null 2>&1 &'
```

4. Compile and install app

Open in Android Studio, click run button with AI Pin as the target.

5. Usage

Press and hold the touch surface and speak your question
