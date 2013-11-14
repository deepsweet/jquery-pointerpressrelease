BIN = ./node_modules/.bin
SCRIPT = 'jquery-pointerpressrelease'
HEADER = "`cat src/header.js`"

.PHONY: eslint
eslint:
	@$(BIN)/eslint src/

.PHONY: jscs
jscs:
	@$(BIN)/jscs src/

.PHONY: test
test: eslint jscs

.PHONY: strip
strip:
	@$(BIN)/uglifyjs src/$(SCRIPT).js \
		-b indent-level=4 \
		-o $(SCRIPT).js \
		--preamble $(HEADER)

.PHONY: min
min:
	@$(BIN)/uglifyjs src/$(SCRIPT).js \
		-c -m \
		--preamble $(HEADER) \
		--source-map $(SCRIPT).min.js.map \
		-o $(SCRIPT).min.js

.PHONY: dist
dist: strip min

.PHONY: version
version:
	@sed -i '' 's/\("version": \)".*"/\1"$(v)"/' \
		bower.json \
		package.json \
		pointerevents.jquery.json

	@sed -i '' 's/\(@version\).*/\1 $(v)/' src/$(SCRIPT).js
	@sed -i '' 's/ v.*/ v$(v)/' src/header.js
