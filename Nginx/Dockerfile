# Use the Nginx image from Docker Hub
FROM nginx:latest

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Replace the default Nginx configuration file with our own
COPY ./default.conf /etc/nginx/conf.d/default.conf
