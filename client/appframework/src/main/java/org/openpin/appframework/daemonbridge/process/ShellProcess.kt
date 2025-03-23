package org.openpin.appframework.daemonbridge.process

open class ShellProcess(
    var command: String
) {
    var output: String = ""
    var error: String = ""
    var pid: String = ""
}