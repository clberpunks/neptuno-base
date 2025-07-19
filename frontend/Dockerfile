# Dockerfile for the frontend application
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Especifica el host y puerto para Next.js
ENV HOST=0.0.0.0 PORT=3000
# logs
ENV NEXT_TELEMETRY_DISABLED=1
ENV DEBUG=next:*

EXPOSE 3000

#CMD ["sh", "-c", "cd .next/standalone && node neptuno-base/frontend/server.js --hostname 0.0.0.0 --port 3000"]


#CMD ["npm", "run", "dev"]

CMD ["npm", "run", "start"]

#CMD ["sh", "-c", "node .next/standalone/server.js"]

#CMD ["sh", "-c", "npm run build && node .next/standalone/server.js --hostname 0.0.0.0"]

#CMD ["sh", "-c", "npm run build && node .next/standalone/server.js"]




