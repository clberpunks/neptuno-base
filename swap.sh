# 1. Crear swap file de 4GB (mismo tamaño que tu RAM)
sudo fallocate -l 4G /swapfile

# 2. Asegurar permisos (seguridad crítica en 2025)
sudo chmod 600 /swapfile && sudo chown root:root /swapfile

# 3. Activar con prioridad y optimizaciones SSD
sudo mkswap -f /swapfile
sudo swapon -p 10 /swapfile  # Prioridad media

# 4. Hacerlo persistente (con fsync seguro)
echo '/swapfile none swap sw,noatime,discard 0 0' | sudo tee -a /etc/fstab

# 5. Ajustes clave para Next.js (2025 best practices):
echo 'vm.swappiness=15' | sudo tee -a /etc/sysctl.conf          # Más conservador que el default 60
echo 'vm.vfs_cache_pressure=40' | sudo tee -a /etc/sysctl.conf  # Mejor para Node.js
echo 'vm.dirty_ratio=10' | sudo tee -a /etc/sysctl.conf         # Escribe antes en disco
sudo sysctl -p

#sudo swapoff /swapfile  # Desactiva swap actual
#sudo fallocate -l 6G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
# Uso de swap (si "Used" > 0 frecuentemente, considera más RAM):
#free -h

# Procesos consumiendo más memoria:
#sudo smem -t -k -P "next|node"

# Presión de memoria (1.0 = crítico):y
