# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your app's source code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Command to run your app
CMD ["node", "index.js"]
