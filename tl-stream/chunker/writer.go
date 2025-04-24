package chunker

import (
	"bufio"
	//"encoding/binary"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

/* ------------------------------------------------------------------
   Pure-container Ogg page parser  (no codec assumptions)
   ------------------------------------------------------------------ */

const (
	oggSig        = "OggS"
	fixedHdrBytes = 27 // sig[4] + fixed fields up to segCount
)

// readPage reads one *complete* Ogg page from r and writes it to dst.
// It returns (bytesWritten, io.EOF) when the stream ends cleanly.
func readPage(r *bufio.Reader, dst io.Writer) (int64, error) {
	// scan for signature
	for {
		b, err := r.ReadByte()
		if err != nil {
			return 0, err
		}
		if b == 'O' {
			peek, _ := r.Peek(3)
			if len(peek) == 3 && peek[0] == 'g' && peek[1] == 'g' && peek[2] == 'S' {
				break
			}
		}
	}

	// we already consumed 'O', write it
	if _, err := dst.Write([]byte{'O'}); err != nil {
		return 0, err
	}
	written := int64(1)

	// read the rest of the fixed header (26 bytes)
	   hdr := make([]byte, fixedHdrBytes-1)
	   if _, err := io.ReadFull(r, hdr); err != nil {
	       return written, err
	   }
	   if _, err := dst.Write(hdr); err != nil {
	       return written, err
	   }
	   written += int64(len(hdr))
	
	   // segCount is the last byte of that 26-byte header
	   segCount := int(hdr[len(hdr)-1])
	segTable := make([]byte, segCount)
	if _, err := io.ReadFull(r, segTable); err != nil {
		return written, err
	}
	if _, err := dst.Write(segTable); err != nil {
		return written, err
	}
	written += int64(segCount)

	// payload length = sum(segment sizes)
	payloadLen := 0
	for _, s := range segTable {
		payloadLen += int(s)
	}
	if payloadLen == 0 {
		return written, nil
	}

	if _, err := io.CopyN(dst, r, int64(payloadLen)); err != nil {
		return written, err
	}
	written += int64(payloadLen)
	return written, nil
}

/* ------------------------------------------------------------------
   Chunk writer
   ------------------------------------------------------------------ */

type Writer struct {
	dir         string
	file        *os.File
	idx         int
	written     int64
	deletedUpTo int
}

func NewWriter(dir string) (*Writer, error) {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}
	f, err := os.Create(filepath.Join(dir, "000000.raw"))
	if err != nil {
		return nil, err
	}
	return &Writer{dir: dir, file: f}, nil
}

func (w *Writer) Write(br *bufio.Reader) error {
	for {
		n, err := readPage(br, w.file)
		w.written += n
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if w.written >= TargetChunk {
			if err = w.roll(); err != nil {
				return err
			}
		}
	}
	w.file.Close()
	return w.seal(w.idx + 1)
}

func (w *Writer) roll() error {
	if err := w.file.Close(); err != nil {
		return err
	}
	if err := w.seal(w.idx + 1); err != nil {
		return err
	}
	w.idx++
	name := filepath.Join(w.dir, fmt.Sprintf("%06d.raw", w.idx))
	f, err := os.Create(name)
	if err != nil {
		return err
	}
	w.file = f
	w.written = 0
	Wait(w.dir, w.idx, &w.deletedUpTo)
	return nil
}

func (w *Writer) seal(idx int) error {
	f, err := os.Create(filepath.Join(w.dir, fmt.Sprintf("%06d.raw", idx)))
	if err == nil {
		f.Close()
	}
	return err
}
