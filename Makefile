.DEFAULT_GOAL := check

ZIRAN ?= ziran
BUILD := build
HOST := tree_view_host

# The behavior test draws through Kryon's host capabilities; its host module
# provides them. Kryon's modules are named by their import paths.
BINDS := \
	--bind kryon/font_metrics:MeasureGlyphWidth=$(HOST):MeasureGlyphWidth \
	--bind kryon/font_metrics:MeasureGlyphLineHeight=$(HOST):MeasureGlyphLineHeight \
	--bind kryon/raster_text:RasterText=$(HOST):RasterText \
	--bind kryon/raster_text:RasterTextClipped=$(HOST):RasterTextClipped \
	--bind kryon/raster_shape:RasterRoundedRectangle=$(HOST):RasterRoundedRectangle \
	--bind kryon/raster_shape:RasterRoundedRectangleOutline=$(HOST):RasterRoundedRectangleOutline \
	--bind kryon/raster:RasterLine=$(HOST):RasterLine \
	--bind kryon/paint_queue:RasterImage=$(HOST):RasterImage

.PHONY: check clean

check:
	$(ZIRAN) check --project
	$(ZIRAN) check --project src/table_view_laws.zi
	$(ZIRAN) check --project src/tree_view_laws.zi
	$(ZIRAN) bundle --project --entry table_view_behavior:main \
		-o $(BUILD)/table-view.zib tests/table_view_behavior.zi
	test "$$($(ZIRAN) run --project $(BUILD)/table-view.zib)" = 0
	$(ZIRAN) bundle --project $(BINDS) --entry tree_view_behavior:main \
		-o $(BUILD)/tree-view.zib tests/tree_view_behavior.zi
	test "$$($(ZIRAN) run --project $(BUILD)/tree-view.zib)" = 0
	@if command -v go >/dev/null; then \
		rm -rf $(BUILD)/tree-view-go && \
		$(ZIRAN) build --project --target=go --pkg main --exe $(BINDS) \
			--entry tree_view_behavior:main -o $(BUILD)/tree-view-go \
			tests/tree_view_behavior.zi && \
		cd $(BUILD)/tree-view-go && env -u DISPLAY -u WAYLAND_DISPLAY \
			GO111MODULE=off go run *.go ; \
	fi

clean:
	rm -rf $(BUILD)
