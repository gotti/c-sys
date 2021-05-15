FROM ubuntu:20.10

RUN apt update -qq && apt upgrade

WORKDIR /cps

COPY bin/main /cps/main

CMD ["main"]
