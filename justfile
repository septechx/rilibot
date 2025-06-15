set shell := ["bash", "-cu"]

run:
    set -a
    source .env
    set +a
    cargo run