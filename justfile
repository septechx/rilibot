set dotenv-load

[working-directory: 'web']
runweb:
    pnpm run dev

check:
    cargo check -Dwarnings

clean:
    cargo clean
    rm -rf web/node_modules
    rm -rf web/.next
