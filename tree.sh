#!/bin/bash

# Comprobar si estamos en la raíz del proyecto
if [ ! -d "./src" ]; then
  echo "Error: La carpeta 'src' no se encuentra en el directorio actual."
  echo "Por favor, ejecuta este script desde la raíz de tu proyecto NestJS."
  exit 1
fi

echo "==============================================="
echo "Estructura de la carpeta src:"
echo "==============================================="

# Muestra la estructura de directorios de manera jerárquica sin archivos node_modules
find ./src -type d -not -path "*/node_modules/*" | sort | sed -e 's;[^/]*/;|-- ;g;s;|-- |; |   ;g'

echo ""
echo "==============================================="
echo "Archivos TypeScript encontrados:"
echo "==============================================="

# Muestra todos los archivos .ts en src
find ./src -name "*.ts" -not -path "*/node_modules/*" | sort | sed -e 's;[^/]*/;|-- ;g;s;|-- |; |   ;g'