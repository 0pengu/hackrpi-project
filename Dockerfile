FROM node:18-alpine AS base

WORKDIR /app

# Copy package.json and package-lock.json separately for caching purposes
COPY package.json pnpm-lock.yaml /app/

# Install dependencies in a separate layer
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM base AS builder

# Copy the node_modules from the 'deps' stage
COPY --from=base /app/node_modules /app/node_modules

# Copy the rest of the application source code
COPY . /app

# Run the build
RUN npm run build

FROM python:3.12-alpine AS runner

WORKDIR /app

RUN pip3 install gunicorn flask flask_caching requests geojson


ENV NODE_ENV=production

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src/backend/app.py /app/src/backend/app.py

EXPOSE 8080

WORKDIR /app/src/backend
CMD gunicorn -b 0.0.0.0:8080 app:app