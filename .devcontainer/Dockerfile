FROM oven/bun:debian AS bun
# using image with ros humble already installed
# https://hub.docker.com/_/ros/
FROM ros:humble-ros-core-jammy
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun /usr/local/bin/bunx /usr/local/bin/bunx

# change shell to bash
SHELL ["/bin/bash", "-c"]


###########################
# INSTALL SYSTEM PACKAGES #
###########################

# add standard packages
RUN yes | unminimize

# it may seem odd that this is one giant RUN command, but this is done to ensure
#   two main things. first, we minimize `apt-get update` commands to respect
#   ubuntu's free to use package repositories. second it ensures sure we don't ever
#   save the apt cache to a docker layer which would make the image larger than it
#   needs to be and may cause issues with having an ancient package cache
RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get -y install \
    # add basic repos and curl so we can grab keys from online
        software-properties-common curl \
    #
    # add the universe repo where many of our packages are from
    && add-apt-repository -y universe \
    #
    # add the repo for docker
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list \
    #
    # add the repo for extra ros things
    # see: <https://colcon.readthedocs.io/en/released/user/installation.html>
    && echo "deb [arch=amd64,arm64] http://repo.ros2.org/ubuntu/main `lsb_release -cs` main" > /etc/apt/sources.list.d/ros2-latest.list \
    && curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | apt-key add - \
    #
    # now the final giant apt update to get the latest caches
    && apt-get update \
    #
    && apt-get -y install \
        # install basic dev tools
        make build-essential \
        cmake git vim sudo g++ man-db bash-completion \
        jq unzip gnupg2 ca-certificates aria2 iputils-ping \
        # install docker
        docker-ce-cli \
        # add colcon
        python3-colcon-common-extensions \
        # add ros-dev-tools for development toolchain
        ros-dev-tools ros-humble-demo-nodes-cpp \
        # install python build requirements for pyenv
        # see: <https://github.com/pyenv/pyenv/wiki#suggested-build-environment>
        libssl-dev zlib1g-dev libbz2-dev libreadline-dev \
        libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev \
        libxmlsec1-dev libffi-dev liblzma-dev \
        debian-keyring debian-archive-keyring apt-transport-https \
    #
    # clean up apt cache
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# install starship (better bash prompt)
RUN curl -sS https://starship.rs/install.sh | sudo sh -s -- -y

# set up astra user
RUN useradd -m -U astra \
    && usermod -a -G sudo astra \
    && chsh -s /usr/bin/bash astra \
    && passwd -d astra


###########################
# SWITCH TO NON-ROOT USER #
###########################

USER astra

# we want scripts to be able to modify our bashrc, but we also
#   want pretty strong control over its contents. to achieve this,
#   we create a separate file that we source in our bashrc that we
#   can link from /release without worrying about it being overwritten
RUN echo 'source ~/.dev_bashrc' > ~/.bashrc
RUN ln -s /release/.devcontainer/.bashrc ~/.dev_bashrc

# python stuff first for better caching (it takes eons)
# install pyenv so we can use python 3.10 required by ros2 humble
ENV PYENV_ROOT="/home/astra/.pyenv"
RUN curl https://pyenv.run | bash

# install python 3.10.
#   empy is broken in 3.11 with colcon, so we need to use 3.10
ENV PY_VERSION=3.10
RUN $PYENV_ROOT/bin/pyenv install $PY_VERSION -v \
    && $PYENV_ROOT/bin/pyenv global $PY_VERSION

# install poetry via pipx.
#   poetry is our package manager for backend. it's used to manage python dependencies
#   without being a pile of garbage like pip
RUN $PYENV_ROOT/bin/pyenv exec pip install -U pipx \
    && $PYENV_ROOT/bin/pyenv exec python -m pipx install poetry

# install required python packages for colcon builds.
#   normally these would be installed by poetry, but we don't want to make many assumptions
#   about the layout of either submodule, so we install them here
RUN $PYENV_ROOT/bin/pyenv exec pip install -U \
    'empy>=3.3.4,<3.4.0' \
    'catkin-pkg>=1.0.0,<1.1.0' \
    'lark>=1.2.2,<1.3.0' \
    'numpy>=2.2.4,<2.3.0'

