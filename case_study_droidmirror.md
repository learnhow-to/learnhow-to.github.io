# Engineering Case Study: DroidMirror Studio
**Lightweight Android Testing Companion & Screen Mirroring Workspace**

- **Author:** Fatur
- **Background:** Civil Construction Worker in Japan & Software Builder
- **Project Repository:** [github.com/learnhow-to/droid-mirror-studio](https://github.com/learnhow-to/droid-mirror-studio)
- **Tech Stack:** Python 3.12, PySide6 (Qt6), scrcpy 4.1, ADB Shell, Win32 API, Android MediaStore Broadcasts

---

## Executive Summary
Developing and testing Android software on physical hardware is necessary for authentic real-world behavior (camera hardware, OEM power management, biometric sensors, and wireless connectivity). However, working with a physical device often introduces significant workflow friction: switching between terminal ADB commands, phone screens, and IDEs. Meanwhile, standard Android Studio AVD emulators consume between 2,048 and 4,096 MB of RAM, placing severe load on modest development laptops.

**DroidMirror Studio** was engineered as an open-source desktop testing companion for Windows. By pairing a responsive PySide6 control deck with the hardware-accelerated scrcpy mirroring engine, it delivers 60 FPS screen interaction, 1-click test actions, automatic MediaStore file routing, and real-time logcat crash capture in approximately 100 MB of total desktop RAM.

---

## The STAR Engineering Breakdown

### 1. Situation (The Real-World Bottlenecks)
Testing applications on physical Android devices introduced repeated daily friction points:
1. **Command Repetition:** Developers repeatedly type lengthy ADB shell commands (`adb shell pm clear`, `adb shell pm grant`, `adb logcat`, `adb shell input`).
2. **Context Switching:** Picking up the physical handset to swipe, unlock, or check notifications distracts from code analysis.
3. **Storage Indexing Disconnect:** Pushing assets via standard `adb push` places files in storage paths where Android's native MediaStore content provider fails to index them without a manual device reboot.
4. **Log Noise:** Catching crashes required filtering thousands of logcat lines per second in a terminal window.

---

### 2. Task (Engineering Objectives & Constraints)
The goal was to build a standalone, low-memory Windows companion tool with concrete requirements:
- **Resource Footprint:** Total desktop memory consumption under 120 MB (allowing it to run continuously alongside memory-heavy IDEs).
- **Latency & Display:** Low-latency hardware-accelerated video streaming at up to 60 FPS with full keyboard and mouse input passthrough, correctly scaled on Windows High-DPI screens (125%–200%).
- **Asynchronous Execution:** Ensure zero GUI freezes during ADB shell command execution.
- **Workflow Utilities:** 1-click QA actions (restart, clear cache, permissions), file push with automatic Android Gallery indexing, and instant crash stacktrace isolation.

---

### 3. Action (Architecture & Technical Decisions)

#### A. Multi-Threaded Concurrency (QThread)
All ADB commands (device polling, package listing, intent dispatching, logcat streaming) run in isolated `QThread` worker classes. Communication between workers and the PySide6 user interface occurs strictly via strongly typed Qt signals, guaranteeing that the GUI stays completely fluid at 60 FPS without cursor freezes or operating system 'Not Responding' warnings.

#### B. Win32 High-DPI Coordinate Mapping
Windows laptops commonly employ 125% to 200% display scaling. Passing raw logical coordinates to external window surfaces via standard Win32 `MoveWindow` caused the mirrored display to render in a quartered or distorted frame.
- **Solution:** Integrated `ctypes.windll.user32` to query monitor DPI and scaled logical Qt coordinates by `window.devicePixelRatioF()`. Executed `SetWindowPos` with `SWP_FRAMECHANGED` to force an SDL viewport resize, ensuring crisp rendering across scaled displays.

#### C. Android 10+ Scoped Storage & Broadcast Pipeline
Direct file pushes to `/sdcard/Download/` are not automatically scanned by the Android MediaStore.
- **Solution:** Implemented intelligent MIME-type routing:
  - Images (`.png`, `.jpg`, `.webp`) -> `/sdcard/Pictures/`
  - Videos (`.mp4`, `.mkv`) -> `/sdcard/Movies/`
  - Documents & APKs -> `/sdcard/Download/`
- Immediately after transfer, dispatched a system broadcast:
  `am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file://<path>"`
- Dispatched an audible status bar notification via `cmd notification post` to confirm receipt on the handset.

#### D. Crash Catcher Logcat Parser
A background worker reads the `adb logcat -v time` stream through a multi-line accumulator. When fatal signatures (`FATAL EXCEPTION`, `AndroidRuntime`, `SIGSEGV`) are parsed:
- The GUI highlights an alert badge.
- The contiguous stacktrace is isolated from ambient log noise.
- A 1-click button copies the isolated stacktrace directly to the Windows clipboard for issue reporting.

---

### 4. Result (Verified Local Benchmark Data)

| Metric | Baseline (Android Studio AVD) | DroidMirror Studio | Measured Difference |
| :--- | :--- | :--- | :--- |
| **Dashboard RAM** | N/A (Embedded in IDE) | **~38 MB** | Lightweight PySide6 process |
| **Streaming RAM** | N/A | **~68 MB** | Hardware-accelerated decoding |
| **Total Desktop RAM** | **2,048 MB – 4,096 MB** | **~106 MB** | **~20x to 40x lighter than full AVD** |
| **Video Frame Rate** | 30 – 45 FPS (emulated GPU) | **Up to 60 FPS** | Smooth over 5GHz Wi-Fi or USB |
| **App Reset Turnaround** | ~40 seconds (manual taps/typing) | **~1.2 seconds** | Single-click stop + clear + relaunch |
| **File Push to Gallery** | Requires phone reboot / browse | **< 2 seconds** | Immediate Gallery indexing via broadcast |
| **Crash Extraction** | 2–4 min scrolling terminal | **Instant (< 200ms)** | Isolated stacktrace in UI buffer |

*Measurement Environment: Windows 11 Home 64-bit, Python 3.12, scrcpy 4.1, Physical Android handset over 5GHz Wi-Fi. Measurements taken via Windows Task Manager and automated test harnesses.*

---

## Current Status & Limitations
- **Current Status:** Functional Desktop Prototype (v0.2), fully verified on Windows 11.
- **Host Dependency:** Requires `adb` and `scrcpy` binaries available on the host machine.
- **Network Dependency:** High frame rates require a clean 5GHz Wi-Fi connection or direct USB cable.
- **Audio Forwarding:** Requires Android 11+ (limitation of Android audio capture architecture).
