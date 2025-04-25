package main

import (
	"context"
	"fmt"

	"io"
	"net/http"
	"os"
	"os/signal"

	//"time"

	"github.com/ebitengine/oto/v3"
	"github.com/jfreymuth/oggvorbis"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: audio_stream <url>")
		os.Exit(1)
	}
	url := os.Args[1]

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	if err := streamAndPlay(ctx, url); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func streamAndPlay(ctx context.Context, url string) error {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	decoder, err := oggvorbis.NewReader(resp.Body)
	if err != nil {
		return err
	}

	op := &oto.NewContextOptions{
		SampleRate:   decoder.SampleRate(),
		ChannelCount: decoder.Channels(),
		Format:       oto.FormatSignedInt16LE,
	}
	audioCtx, ready, err := oto.NewContext(op)
	if err != nil {
		return err
	}
	<-ready

	pcm := NewPCMReader(decoder)
	player := audioCtx.NewPlayer(pcm)
    player.Play()
	defer player.Close()

	fmt.Println("Playing... press Ctrl+C to stop")
	<-ctx.Done()
	return nil
}


type PCMReader struct {
	decoder *oggvorbis.Reader
	buf     []float32
	pos     int
}

func NewPCMReader(dec *oggvorbis.Reader) *PCMReader {
	return &PCMReader{
		decoder: dec,
		buf:     make([]float32, 4096),
	}
}

func (r *PCMReader) Read(p []byte) (int, error) {
	outPos := 0

	for outPos+1 < len(p) {
		if r.pos >= len(r.buf) {
			n, err := r.decoder.Read(r.buf)
            fmt.Println("Read", n, "samples")
			if err != nil && err != io.EOF {
				return 0, err
			}
			r.buf = r.buf[:n]
			r.pos = 0
			if n == 0 {
				return outPos, io.EOF
			}
		}

		// Convert float32 sample to int16
		sample := int16(r.buf[r.pos] * 32767)
		p[outPos] = byte(sample)
		p[outPos+1] = byte(sample >> 8)
		outPos += 2
        fmt.Println("PCMReader sending", outPos, "bytes")
		r.pos++
	}

	return outPos, nil
}
