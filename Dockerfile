FROM node:14-slim
WORKDIR /app
RUN apt-get update && apt-get install imagemagick -y
COPY . .
CMD ["npm", "start"]
