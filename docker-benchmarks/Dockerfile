FROM node:20-alpine

# Install git and build tools
RUN apk add --no-cache git python3 make g++ rust cargo

# Install global tools
RUN npm i -g vite webpack rspack rollup esbuild @angular/cli typescript tsx

# Setup Nexxo (Local)
# In a real CI, we'd install from registry. Here we copy local source.
WORKDIR /nexxo-source
COPY . /nexxo-source
RUN npm install
RUN npm run build
RUN npm link

# Setup Benchmarks
WORKDIR /app
COPY docker-benchmarks/package*.json ./
RUN npm install
COPY docker-benchmarks/ .

# Link Nexxo
RUN npm link nexxo

CMD ["npm", "run", "bench"]
