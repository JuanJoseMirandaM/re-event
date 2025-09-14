FROM public.ecr.aws/lambda/python:3.11

# Instalar zip
RUN yum install -y zip

# Crear directorio para el layer
RUN mkdir -p /opt/python

# Copiar requirements.txt
COPY requirements.txt /tmp/requirements.txt

# Instalar dependencias desde requirements.txt
RUN pip install -r /tmp/requirements.txt -t /opt/python/

# Crear el ZIP del layer
WORKDIR /opt
RUN zip -r python311-layer.zip python/

# Sobrescribir entrypoint y comando
ENTRYPOINT []
CMD ["cp", "/opt/python311-layer.zip", "/output/"]


# Commands
# docker build -t layer-builder .
# docker run --rm -v D:/index/aws/ComunityDay/face-finder-project/lambdas:/output --entrypoint="" layer-builder sh -c "cp /opt/python311-layer.zip /output/"
