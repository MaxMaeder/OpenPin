package main

import (
	"bufio"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"ogg_stream/chunker"
)

func main() {
	if len(os.Args) != 5 {
		fmt.Fprintf(os.Stderr, "usage: %s <host> <port> <path> <out_dir>\n", os.Args[0])
		os.Exit(1)
	}
	host, port, path, outDir := os.Args[1], os.Args[2], os.Args[3], os.Args[4]
	url := fmt.Sprintf("http://%s:%s%s", host, port, path)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	req.Header.Set("Accept-Encoding", "identity")

	tr := &http.Transport{DisableCompression: true}
	resp, err := tr.RoundTrip(req)
	must(err)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		must(fmt.Errorf("http status: %s", resp.Status))
	}

	writer, err := chunker.NewWriter(outDir)
	must(err)

	br := bufio.NewReaderSize(resp.Body, 32*1024)
	must(writer.Write(br))
}

func must(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "fatal:", err)
		os.Exit(1)
	}
}
