package chunker

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func readPacing(dir string) int {
	data, err := os.ReadFile(filepath.Join(dir, "pacing.txt"))
	if err != nil {
		return -1
	}
	v, err := strconv.Atoi(strings.TrimSpace(string(data)))
	if err != nil {
		return -1
	}
	return v
}

func deleteBefore(dir string, upto int) {
	for i := 0; i < upto; i++ {
		os.Remove(filepath.Join(dir, fmt.Sprintf("%06d.raw", i)))
	}
}

// Wait blocks until writer is within MaxAhead of reader.
// It also deletes chunks < pace-KeepHistory.
func Wait(dir string, idx int, deleted *int) {
	for {
		pace := readPacing(dir)
		if pace >= 0 && idx-pace > MaxAhead {
			time.Sleep(PollInterval)
			continue
		}
		if pace >= 0 && pace-KeepHistory > 0 && pace-KeepHistory > *deleted {
			deleteBefore(dir, pace-KeepHistory)
			*deleted = pace - KeepHistory
		}
		break
	}
}