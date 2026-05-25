FROM node:18-alpine

# Install Python and pip for the AI integration
RUN apk add --no-cache python3 py3-pip
ENV PYTHON_BIN=python3

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

# Start server
CMD ["npm", "start"]
