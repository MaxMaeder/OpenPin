plugins {
    kotlin("multiplatform") version "1.9.0"
}

repositories {
    mavenCentral()
}

kotlin {
    androidNativeArm64("native") {  // Target ARM64 Android devices
        binaries {
            executable {
                entryPoint = "org.openpin.daemon.main"
            }
        }
    }

    sourceSets {
        val nativeMain by getting {
            dependencies {
                implementation(kotlin("stdlib"))
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-androidnativearm64:1.7.0")
            }
        }
    }
}

tasks.register("deployToAdb") {
    dependsOn("linkDebugExecutableNative")

    doLast {
        val binaryPath = "build/bin/native/debugExecutable/daemon.kexe"
        val adbCommand = "/opt/homebrew/bin/adb"
        val adbPath = "/data/local/tmp/daemon"

        println("Pushing binary to device...")
        exec {
            commandLine(adbCommand, "push", binaryPath, adbPath)
        }

        println("Granting execute permissions...")
        exec {
            commandLine(adbCommand, "shell", "chmod", "+x", adbPath)
        }

        println("Running the binary on ADB target...")
        exec {
            commandLine(adbCommand, "shell", adbPath)
        }
    }
}
