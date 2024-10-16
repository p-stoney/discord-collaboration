# Stage 1: Build Stage
FROM node:18 as builder

ARG APP_VERSION=0.0.1
ENV APP_VERSION=$APP_VERSION

WORKDIR /usr/src/app

# Install all dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18 as production

WORKDIR /usr/src/app

# Copy only the necessary production files from the build stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
