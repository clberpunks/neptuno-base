# Dockerfile for the frontend application
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Especifica el host y puerto para Next.js
ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000

#CMD ["npm", "run", "dev"]

CMD ["npm", "run", "start"]

#CMD ["sh", "-c", "npm run build && node .next/standalone/server.js"]




