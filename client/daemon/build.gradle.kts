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
                entryPoint = "main"
            }
        }
    }

    sourceSets {
        val nativeMain by getting {
            dependencies {
                implementation(kotlin("stdlib"))
            }
        }
    }
}

tasks.register("deployToAdb") {
    dependsOn("linkDebugExecutableNative")

    doLast {
        val binaryPath = "build/bin/native/debugExecutable/daemon.kexe"
        val adbPath = "/data/local/tmp/daemon"

        println("Pushing binary to device...")
        exec {
            commandLine("adb", "push", binaryPath, adbPath)
        }

        println("Granting execute permissions...")
        exec {
            commandLine("adb", "shell", "chmod", "+x", adbPath)
        }

        println("Running the binary on ADB target...")
        exec {
            commandLine("adb", "shell", adbPath)
        }
    }
}
