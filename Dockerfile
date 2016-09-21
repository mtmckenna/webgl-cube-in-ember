FROM ubuntu:16.04
MAINTAINER Matt McKenna <matt@mtmckenna.com>
RUN apt-get update
RUN apt-get purge nodejs npm

RUN apt-get install -y curl git vim ack-grep htop tmux ruby build-essential bzip2 autoconf automake build-essential python-dev net-tools

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash
RUN apt-get install -y nodejs

RUN gem install tmuxinator

RUN npm install -g phantomjs-prebuilt ember-cli bower nodemon babel-cli mocha

RUN mkdir /root/workspace

ADD https://github.com/mtmckenna/dotfiles/archive/master.zip /dotfiles.zip

RUN curl -L https://bit.ly/janus-bootstrap | bash
RUN mkdir /root/.janus/
RUN cd /root/.janus/ && git clone https://github.com/tpope/vim-vinegar.git

RUN unzip /dotfiles.zip
RUN cp -r dotfiles-master/. /root
RUN rm /dotfiles.zip
RUN rm /root/README.md

EXPOSE 4200 49152 3000
