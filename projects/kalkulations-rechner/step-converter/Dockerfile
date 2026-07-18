FROM mambaorg/micromamba:1.5

USER root
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

COPY environment.yml /tmp/environment.yml
RUN micromamba install -y -n base -f /tmp/environment.yml && \
    micromamba clean --all --yes

COPY app/ /app/app/

ENV UPLOAD_DIR=/tmp/uploads
EXPOSE 8000

CMD ["micromamba", "run", "-n", "base", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
