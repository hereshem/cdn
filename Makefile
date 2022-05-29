TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =

install-test:
	@NODE_ENV=test npm install

test: install-test
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

.PHONY: test

install:
	npm install

run:
	npm start

docker-build:
	docker build . -t hub.hemshrestha.com.np/cdn:latest

docker-run:
	docker run --name cdn -p 30001:8015 -v `pwd`/public:/app/public -d hub.hemshrestha.com.np/cdn
