# OpenPin

A fix for the disabled Humane AI Pins. Very basic / buggy right now!

## Installing/Running

1. Get ADB access & make sure AI Pin is unlocked

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

Install `gradle`:

```bash
# For mac
brew install gradle
```

From inside `daemon` folder:

```bash
./gradlew build
adb push build/bin/native/debugExecutable/daemon.kexe /data/local/tmp/daemon
adb shell 'nohup /data/local/tmp/daemon > /dev/null 2>&1 &'
```

4. Compile and install app

Open in Android Studio, click run button with AI Pin as the target.

Now, use `scrcpy` to open a copy of the AI Pin screen on your computer. We need this to accept the Android permission dialogs the app will prompt.

Install `scrcpy`:

```bash
# For mac
brew install scrcpy
```

Prevent the display from going to sleep:

```bash
adb shell cmd power disable-humane-display-controller
adb shell settings put global stay_on_while_plugged_in 3
```

Open `scrcpy`:

```bash
scrcpy
```

Click 'allow' on the microphone permission, then move the slider to 'enabled' for the file storage permission.
If scrcpy stays blank, trigger the laser ink.

Re-enable display auto-sleep (helps with thermals & battery):

```bash
adb shell settings put global stay_on_while_plugged_in /dev/null
adb shell cmd power enable-humane-display-controller
```

5. Usage

Press and hold the touch surface and speak your question
