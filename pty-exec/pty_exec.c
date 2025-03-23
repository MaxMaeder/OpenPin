// pty_exec.c
#define _GNU_SOURCE
#include <fcntl.h>
#include <pty.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char* argv[]) {
  if (argc < 2) {
    fprintf(stderr, "Usage: %s <command string>\n", argv[0]);
    return 1;
  }

  const char* command = argv[1];

  int master_fd;
  pid_t pid = forkpty(&master_fd, NULL, NULL, NULL);
  if (pid < 0) {
    perror("forkpty");
    return 2;
  }

  if (pid == 0) {
    // In child
    execl("/system/bin/sh", "sh", "-c", command, (char*)NULL);
    perror("exec");
    _exit(127);
  }

  // In parent: read from PTY and write to stdout
  char buffer[1024];
  ssize_t n;
  while ((n = read(master_fd, buffer, sizeof(buffer))) > 0) {
    write(STDOUT_FILENO, buffer, n);
  }

  int status;
  waitpid(pid, &status, 0);
  return WIFEXITED(status) ? WEXITSTATUS(status) : -1;
}
