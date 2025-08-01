# Builder stage
FROM rust:1.87-slim as builder

WORKDIR /usr/src/app
COPY . .

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /usr/local/bin

# Copy the binary from builder
COPY --from=builder /usr/src/app/target/release/rilibot .

# Run as non-root user
RUN useradd -m -u 1000 bot
USER bot

# Set the entrypoint
ENTRYPOINT ["rilibot"] 
