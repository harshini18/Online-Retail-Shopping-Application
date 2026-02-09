#!/bin/bash

# Configuration
MAVEN_BIN="/Users/venkatramanareddyp/Documents/Online Retail Shopping/tools/apache-maven-3.9.6/bin"
NODE_BIN="/Users/venkatramanareddyp/Downloads/Online-Retail-Shopping-main/Online-Retail-Shopping-main/node-v20.11.0-darwin-x64/bin"
PROJECT_ROOT="/Users/venkatramanareddyp/Downloads/Retail-Application-main/Online-Retail-Shopping2-main"

# Add tools to PATH
export PATH="$MAVEN_BIN:$NODE_BIN:$PATH"

# Function to run command in new Terminal window
run_in_new_window() {
    local title="$1"
    local dir="$2"
    local cmd="$3"
    local path_setting="export PATH=\"$MAVEN_BIN:$NODE_BIN:\$PATH\""
    
    # Construct the full command to run
    # Use double quotes for the AppleScript string, so we need to escape backslashes and double quotes inside it
    local complete_cmd="$path_setting; cd '$PROJECT_ROOT/$dir'; echo 'Starting $title...'; $cmd"
    
    # Escape double quotes and backslashes in the command string for AppleScript
    # First escape backslashes, then double quotes
    local escaped_cmd="${complete_cmd//\\/\\\\}"
    escaped_cmd="${escaped_cmd//\"/\\\"}"
    
    # Use osascript with -e to avoid heredoc complexity
    osascript -e "tell application \"Terminal\" to do script \"$escaped_cmd\""
}

echo "Starting generic retail application services..."

# 1. Eureka Server
echo "Launching Eureka Server..."
run_in_new_window "Eureka Server" "eureka-server" "mvn spring-boot:run"
sleep 15

# 2. API Gateway
echo "Launching API Gateway..."
run_in_new_window "API Gateway" "api-gateway" "mvn spring-boot:run"
sleep 10

# 3. Microservices
echo "Launching User Service..."
run_in_new_window "User Service" "user-service" "mvn spring-boot:run"

echo "Launching Product Service..."
run_in_new_window "Product Service" "product-service" "mvn spring-boot:run"

echo "Launching Inventory Service..."
run_in_new_window "Inventory Service" "inventory-service" "mvn spring-boot:run"

echo "Launching Cart Service..."
run_in_new_window "Cart Service" "cart-service" "mvn spring-boot:run"

echo "Launching Payment Service..."
run_in_new_window "Payment Service" "payment-service" "mvn spring-boot:run"

echo "Launching Order Service..."
run_in_new_window "Order Service" "order-service" "mvn spring-boot:run"

echo "Launching Notification Service..."
run_in_new_window "Notification Service" "notification-service" "mvn spring-boot:run"

# Wait for services to initialize
echo "Waiting for services to initialize..."
sleep 20

# 4. Frontend
echo "Launching Frontend..."
# Install dependencies first if needed, then run
run_in_new_window "Frontend" "retail-frontend" "npm install && npm run dev"

echo "All services launched in separate windows!"
