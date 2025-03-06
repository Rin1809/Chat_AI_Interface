FROM python:3.9-slim-buster

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/Chat_Interface/static/uploads

EXPOSE 5000

CMD ["python", "Chat_Interface/app.py"]