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
	--bind kryon/raster_text:RasterTextRotated=$(HOST):RasterTextRotated \
	--bind kryon/raster_shape:RasterRoundedRectangle=$(HOST):RasterRoundedRectangle \
	--bind kryon/raster_shape:RasterRoundedRectangleOutline=$(HOST):RasterRoundedRectangleOutline \
	--bind kryon/raster:RasterLine=$(HOST):RasterLine \
	--bind kryon/paint_queue:RasterImage=$(HOST):RasterImage

KANBAN_BINDS := $(subst tree_view_host,kanban_host,$(BINDS)) \
	--bind kryon/raster_triangles:RasterTriangles=kanban_host:RasterTriangles

TABLE_BINDS := $(subst tree_view_host,table_view_host,$(BINDS))

.PHONY: check check-tree check-tree-native check-table check-table-native clean

check: check-table check-tree
	$(ZIRAN) check --project
	$(ZIRAN) check --project src/table_view_laws.zi
	$(ZIRAN) check --project src/tree_view_laws.zi

	$(ZIRAN) bundle --project $(KANBAN_BINDS) --entry kanban_behavior:main \
		-o $(BUILD)/kanban.zx tests/kanban_behavior.zi
	test "$$($(ZIRAN) run --project $(BUILD)/kanban.zx)" = 0

clean:
	rm -rf $(BUILD)


# Both source and saved checked IR must compile and execute as native C.
check-table-native:
	$(ZIRAN) build --project --target=c --exe --entry table_view_behavior:main -o $(BUILD)/table-behavior-c tests/table_view_behavior.zi
	$(BUILD)/table-behavior-c/table_view_behavior
	$(ZIRAN) ir --project --entry table_view_behavior:main -o $(BUILD)/table-behavior-ir tests/table_view_behavior.zi
	$(ZIRAN) build --project --target=c --exe --entry table_view_behavior:main -o $(BUILD)/table-behavior-saved-c $(BUILD)/table-behavior-ir/table_view_behavior.zir
	$(BUILD)/table-behavior-saved-c/table_view_behavior
	$(ZIRAN) build --project --target=c --exe $(TABLE_BINDS) --entry table_view_render:main -o $(BUILD)/table-render-c tests/table_view_render.zi
	$(BUILD)/table-render-c/table_view_render
	$(ZIRAN) ir --project $(TABLE_BINDS) --entry table_view_render:main -o $(BUILD)/table-render-ir tests/table_view_render.zi
	$(ZIRAN) build --project --target=c --exe --entry table_view_render:main -o $(BUILD)/table-render-saved-c $(BUILD)/table-render-ir/table_view_render.zir
	$(BUILD)/table-render-saved-c/table_view_render

check-table: check-table-native
	$(ZIRAN) bundle --project --entry table_view_behavior:main -o $(BUILD)/table-view.zx tests/table_view_behavior.zi
	test "$$($(ZIRAN) run --project $(BUILD)/table-view.zx)" = 0
	$(ZIRAN) bundle --project $(TABLE_BINDS) --entry table_view_render:main -o $(BUILD)/table-render.zx tests/table_view_render.zi
	test "$$($(ZIRAN) run --project $(BUILD)/table-render.zx)" = 0

	@if command -v go >/dev/null; then \
		rm -rf $(BUILD)/table-render-go && \
		$(ZIRAN) build --project --target=go --pkg main --exe \
			$(TABLE_BINDS) \
			--entry table_view_render:main -o $(BUILD)/table-render-go \
			tests/table_view_render.zi && \
		cd $(BUILD)/table-render-go && env -u DISPLAY -u WAYLAND_DISPLAY \
			GO111MODULE=off go run *.go ; \
	fi

check-tree: check-tree-native
	$(ZIRAN) bundle --project $(BINDS) --entry tree_view_behavior:main \
		-o $(BUILD)/tree-view.zx tests/tree_view_behavior.zi
	test "$$($(ZIRAN) run --project $(BUILD)/tree-view.zx)" = 0
	@if command -v go >/dev/null; then \
		rm -rf $(BUILD)/tree-view-go && \
		$(ZIRAN) build --project --target=go --pkg main --exe $(BINDS) \
			--entry tree_view_behavior:main -o $(BUILD)/tree-view-go \
			tests/tree_view_behavior.zi && \
		cd $(BUILD)/tree-view-go && env -u DISPLAY -u WAYLAND_DISPLAY \
			GO111MODULE=off go run *.go ; \
	fi

check-tree-native:
	$(ZIRAN) build --project --target=c --exe $(BINDS) --entry tree_view_behavior:main -o $(BUILD)/tree-behavior-c tests/tree_view_behavior.zi
	$(BUILD)/tree-behavior-c/tree_view_behavior
	$(ZIRAN) ir --project $(BINDS) --entry tree_view_behavior:main -o $(BUILD)/tree-behavior-ir tests/tree_view_behavior.zi
	$(ZIRAN) build --project --target=c --exe --entry tree_view_behavior:main -o $(BUILD)/tree-behavior-saved-c $(BUILD)/tree-behavior-ir/tree_view_behavior.zir
	$(BUILD)/tree-behavior-saved-c/tree_view_behavior
