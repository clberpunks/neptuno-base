docker-compose down
sudo systemctl stop docker

# Limpieza completa de Docker
sudo docker system prune -a --volumes --force
 
# Limpiar específicamente overlay2
sudo rm -rf /var/lib/docker/overlay2/*
sudo rm -f /var/lib/docker/overlay2/.l*

# Comprobar espacio en disco
df -h /var/lib/docker

# Si está al 100%, liberar espacio:
sudo journalctl --vacuum-size=200M
sudo apt clean

# Reparar sistema de archivos (si es ext4)
sudo umount /var/lib/docker
sudo fsck -y /dev/sda1  # Reemplaza con tu partición
sudo mount -a

sudo systemctl start docker
docker system info | grep Storage  # Verificar que sea overlay2

docker-compose build --no-cache

# reinstal
# sudo apt purge docker-ce docker-ce-cli containerd.io
# sudo rm -rf /var/lib/docker /var/lib/containerd
# sudo apt install docker-ce docker-ce-cli containerd.io