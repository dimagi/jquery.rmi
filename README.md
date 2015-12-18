# RMI-NG

[![Build Status](https://travis-ci.org/dimagi/rmi-ng.svg?branch=master)](https://travis-ci.org/dimagi/rmi-ng)

RMI-NG is a light-weight RPC library inspired by AngularJS.

## Installation

    npm install dimagi/rmi-ng

## Running tests

Run of the following:

    mocha

    mocha --watch

    npm test # also runs jshint

Djangular tests must be run in a browser after starting django:

    cd django-site
    # mkvirtualenv rmi-ng
    pip install -r requirements.txt
    ./manage.py runserver
    # open http://localhost:8000
