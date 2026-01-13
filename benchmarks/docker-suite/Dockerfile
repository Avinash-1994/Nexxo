# Nexxo v2.0 Benchmark Suite Dockerfile
# Includes all rivals for fair comparison

FROM node:20-slim

# Install system dependencies
# - Rust/Cargo for generic building if needed (optional for running pre-built binaries)
# - Bun for Nexxo v2.0 benchmark
# - Git for repo cloning
# - wrk/autocannon for load testing
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install pnpm (often faster/better for monolithic bench repos)
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/benchmarks

# Copy local Nexxo build (assuming we mount or copy the build context)
# For the benchmark suite, we might want to copy everything
COPY . .

# Install dependencies for the root project (Nexxo)
RUN npm install

# Pre-install rival CLIs globaly or locally to save time?
# We will create a local "rivals" directory for them.
RUN mkdir -p rivals

# Setup Vite
RUN cd rivals && npm init -y && npm install vite@latest

# Setup Rspack
RUN cd rivals && npm install @rspack/core@latest @rspack/cli@latest

# Setup Turbopack (via Next.js usually, or partial)
# Installing Next.js as proxy for Turbopack speed tests
RUN cd rivals && npm install next@latest react react-dom

# Setup Angular
RUN cd rivals && npm install @angular/cli@latest

# Verify installations
RUN node -v
RUN bun -v
RUN cd rivals && npx vite -v

# Entry point
CMD ["npx", "tsx", "benchmarks/docker-suite/run-benchmarks.ts"]
