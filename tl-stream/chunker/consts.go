package chunker

import "time"

const (
	TargetChunk  = 1 << 17        // 1 MiB minimum before split
	MaxAhead     = 2              // writer ≤ MaxAhead chunks ahead of reader
	KeepHistory  = 1              // keep at least this many old chunks
	PollInterval = 50 * time.Millisecond
)
