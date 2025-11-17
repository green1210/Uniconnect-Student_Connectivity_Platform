FROM node:20-bullseye-slim

WORKDIR /app

# Copy package files early to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install system dependencies required by Prisma (OpenSSL 1.1)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Install production npm deps
RUN npm install --production

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
