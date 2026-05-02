import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FlipHorizontal, Grid3X3, Group, Library, MousePointer2, PaintBucket, RotateCw, Ruler } from "lucide-react";

const MODULE_MM = 50;
const UNIT = 0.5;
const VISUAL_TILE_UNIT = 0.49;
const TILE_THICKNESS = 0.012;
const MODEL_BASE_COLOR = "#cccccc";

const CATALOG = [
  { id: "scifi_floor_base_a_50_v01", name: "Sci-Fi Floor Tile", category: "floor", theme: "scifi", variant: "base_a", width_mm: 50, depth_mm: 50, height_mm: 6, file_stl: "scifi_floor_base_a_50_v01.stl", file_3mf: "scifi_floor_base_a_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Default floor module. Designed to use build plate texture as final finish." },
  { id: "scifi_floor_base_b_50_v01", name: "Sci-Fi Floor Corner Slots", category: "floor", theme: "scifi", variant: "base_b", width_mm: 50, depth_mm: 50, height_mm: 6, file_stl: "scifi_floor_base_b_50_v01.stl", file_3mf: "scifi_floor_base_b_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Floor module with corner slot detail." },
  { id: "scifi_floor_base_c_50_v01", name: "Sci-Fi Floor Modular 2x2", category: "floor", theme: "scifi", variant: "base_c", width_mm: 50, depth_mm: 50, height_mm: 6, file_stl: "scifi_floor_base_c_50_v01.stl", file_3mf: "scifi_floor_base_c_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Floor module with 2x2 panel pattern." },
  { id: "scifi_wall_base_a_50_v01", name: "Sci-Fi Wall Panel", category: "wall", theme: "scifi", variant: "base_a", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_base_a_50_v01.stl", file_3mf: "scifi_wall_base_a_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Default wall module." },
  { id: "scifi_wall_base_b_50_v01", name: "Sci-Fi Wall Corner Slots", category: "wall", theme: "scifi", variant: "base_b", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_base_b_50_v01.stl", file_3mf: "scifi_wall_base_b_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Wall module with corner slot detail." },
  { id: "scifi_wall_base_c_50_v01", name: "Sci-Fi Wall Modular 2x2", category: "wall", theme: "scifi", variant: "base_c", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_base_c_50_v01.stl", file_3mf: "scifi_wall_base_c_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Wall module with 2x2 panel pattern." },
  { id: "scifi_wall_louver_50_v01", name: "Sci-Fi Wall Louver", category: "wall", theme: "scifi", variant: "louver", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_louver_50_v01.stl", file_3mf: "scifi_wall_louver_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Prepared asset. Not assigned to prototype geometry yet." },
  { id: "scifi_wall_hatch_50_v01", name: "Sci-Fi Wall Hatch", category: "wall", theme: "scifi", variant: "hatch", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_hatch_50_v01.stl", file_3mf: "scifi_wall_hatch_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Prepared asset. Not assigned to prototype geometry yet." },
  { id: "scifi_wall_vent_50_v01", name: "Sci-Fi Wall Vent", category: "wall", theme: "scifi", variant: "vent", width_mm: 50, depth_mm: 8, height_mm: 50, file_stl: "scifi_wall_vent_50_v01.stl", file_3mf: "scifi_wall_vent_50_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Prepared asset. Not assigned to prototype geometry yet." },
  { id: "scifi_wall_panel_light_1x3_v01", name: "Sci-Fi Wall Panel Light", category: "wall", theme: "scifi", variant: "panel_light_1x3", width_mm: 50, depth_mm: 8, height_mm: 150, file_stl: "SCIFI_WALL_1x3_A.stl", file_3mf: "SCIFI_WALL_1x3_A.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "1x3 wall panel using SCIFI_WALL_1x3_A.gltf." },
  { id: "scifi_wall_panel_hatch_1x3_v01", name: "Sci-Fi Wall Panel Hatch", category: "wall", theme: "scifi", variant: "panel_hatch_1x3", width_mm: 50, depth_mm: 8, height_mm: 150, file_stl: "SCIFI_WALL_1x3_B.stl", file_3mf: "SCIFI_WALL_1x3_B.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "1x3 wall panel using SCIFI_WALL_1x3_B.gltf." },
  { id: "scifi_wall_panel_vent_1x3_v01", name: "Sci-Fi Wall Panel Vent", category: "wall", theme: "scifi", variant: "panel_vent_1x3", width_mm: 50, depth_mm: 8, height_mm: 150, file_stl: "SCIFI_WALL_1x3_C.stl", file_3mf: "SCIFI_WALL_1x3_C.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "1x3 wall panel using SCIFI_WALL_1x3_C.gltf." },
  { id: "scifi_connector_floor_h_v01", name: "Floor H Connector", category: "connector", theme: "scifi", variant: "floor_h_connector", width_mm: 18, depth_mm: 8, height_mm: 4, file_stl: "scifi_connector_floor_h_v01.stl", file_3mf: "scifi_connector_floor_h_v01.3mf", print_orientation: "Flat", supports: false, bed_texture_finish: false, notes: "Connector used between floor modules." },
  { id: "scifi_connector_wall_clip_v01", name: "Wall Clip Connector", category: "connector", theme: "scifi", variant: "wall_clip", width_mm: 14, depth_mm: 10, height_mm: 18, file_stl: "scifi_connector_wall_clip_v01.stl", file_3mf: "scifi_connector_wall_clip_v01.3mf", print_orientation: "Flat", supports: false, bed_texture_finish: false, notes: "Approximate wall connector count equals total wall tile count." },
  { id: "scifi_trim_front_50_v01", name: "Front Trim", category: "trim", theme: "scifi", variant: "front_trim", width_mm: 50, depth_mm: 8, height_mm: 8, file_stl: "scifi_trim_front_50_v01.stl", file_3mf: "scifi_trim_front_50_v01.3mf", print_orientation: "Flat", supports: false, bed_texture_finish: false, notes: "Front finishing trim." },
  { id: "scifi_trim_side_50_v01", name: "Side Trim", category: "trim", theme: "scifi", variant: "side_trim", width_mm: 50, depth_mm: 8, height_mm: 8, file_stl: "scifi_trim_side_50_v01.stl", file_3mf: "scifi_trim_side_50_v01.3mf", print_orientation: "Flat", supports: false, bed_texture_finish: false, notes: "Side finishing trim for lateral wall edges." },
  { id: "scifi_accessory_vent_v01", name: "Accessory Vent", category: "accessory", theme: "scifi", variant: "vent", width_mm: 25, depth_mm: 8, height_mm: 25, file_stl: "scifi_accessory_vent_v01.stl", file_3mf: "scifi_accessory_vent_v01.3mf", print_orientation: "Flat", supports: false, bed_texture_finish: false, notes: "Optional accessory. Not included by default." },
  { id: "scifi_accessory_pipe_v01", name: "Accessory Pipe", category: "accessory", theme: "scifi", variant: "pipe", width_mm: 40, depth_mm: 12, height_mm: 12, file_stl: "scifi_accessory_pipe_v01.stl", file_3mf: "scifi_accessory_pipe_v01.3mf", print_orientation: "Flat", supports: true, bed_texture_finish: false, notes: "Optional pipe accessory." },
  { id: "scifi_accessory_manhole_v01", name: "Accessory Manhole", category: "accessory", theme: "scifi", variant: "manhole", width_mm: 38, depth_mm: 38, height_mm: 3, file_stl: "scifi_accessory_manhole_v01.stl", file_3mf: "scifi_accessory_manhole_v01.3mf", print_orientation: "Face-down", supports: false, bed_texture_finish: true, notes: "Optional floor accessory." }
];

const ASSET_BY_ID = Object.fromEntries(CATALOG.map((asset) => [asset.id, asset]));
const DEFAULT_CONFIG = { theme: "Sci-Fi", scale: "1:12", width: 3, depth: 3, height: 3, backWall: true, leftWall: false, rightWall: false };
const DEFAULT_MODEL_BY_TYPE = { floor: "scifi_floor_base_a_50_v01", wall: "scifi_floor_base_a_50_v01" };
const GLTF_MODEL_BY_ID = {
  scifi_floor_base_a_50_v01: "/models/SCIFI_FLOOR_1x1_A.gltf",
  scifi_floor_base_b_50_v01: "/models/SCIFI_FLOOR_1x1_B.gltf",
  scifi_floor_base_c_50_v01: "/models/SCIFI_FLOOR_1x1_C.gltf",
  scifi_wall_base_a_50_v01: "/models/SCIFI_WALL_1x1_A.gltf",
  scifi_wall_base_b_50_v01: "/models/SCIFI_WALL_1x1_B.gltf",
  scifi_wall_base_c_50_v01: "/models/SCIFI_WALL_1x1_C.gltf",
  scifi_wall_panel_light_1x3_v01: "/models/SCIFI_WALL_1x3_A.gltf",
  scifi_wall_panel_hatch_1x3_v01: "/models/SCIFI_WALL_1x3_B.gltf",
  scifi_wall_panel_vent_1x3_v01: "/models/SCIFI_WALL_1x3_C.gltf"
};
const PANEL_SPAN_H = 3;
const PANEL_MODEL_BY_ACTION = {
  panel_light: "scifi_wall_panel_light_1x3_v01",
  panel_hatch: "scifi_wall_panel_hatch_1x3_v01",
  panel_vent: "scifi_wall_panel_vent_1x3_v01"
};
const PANEL_MODEL_IDS = new Set(Object.values(PANEL_MODEL_BY_ACTION));
const LIBRARY_ITEMS = [
  { key: "plain", label: "Plain Tile", family: "floor", iconSrc: "/icons/SCIFI_FLOOR_1x1_A.svg" },
  { key: "corner", label: "Corner Slots", family: "floor", iconSrc: "/icons/SCIFI_FLOOR_1x1_B.svg" },
  { key: "louver", label: "Louver", family: "floor", iconSrc: "/icons/SCIFI_FLOOR_1x1_C.svg" },
  { key: "modular", label: "Wall Light", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x1_A.svg" },
  { key: "hatch", label: "Hatch", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x1_B.svg" },
  { key: "vent", label: "Vent", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x1_C.svg" },
  { key: "panel_light", label: "Panel Light", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x3_A.svg" },
  { key: "panel_hatch", label: "Panel Hatch", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x3_B.svg" },
  { key: "panel_vent", label: "Panel Vent", family: "wall", iconSrc: "/icons/SCIFI_WALL_1x3_A.svg" }
];
const TOOLBAR = [
  { key: "select", label: "Select", Icon: MousePointer2 },
  { key: "library", label: "Library", Icon: Library },
  { key: "group", label: "Group / Ungroup", Icon: Group },
  { key: "rotate", label: "Rotate", Icon: RotateCw },
  { key: "flip", label: "Flip", Icon: FlipHorizontal },
  { key: "paint", label: "Paint", Icon: PaintBucket },
  { key: "ruler", label: "Ruler", Icon: Ruler },
  { key: "grid", label: "Grid", Icon: Grid3X3 }
];

function cx() { return Array.from(arguments).filter(Boolean).join(" "); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function getTileType(tileId) { if (tileId.startsWith("floor_")) return "floor"; if (tileId.startsWith("wall_")) return "wall"; return "unknown"; }
function getWallRotationY(side) { if (side === "left") return Math.PI / 2; if (side === "right") return -Math.PI / 2; return 0; }
function getStoredPaintColor(previous) {
  const legacyDefaultColors = new Set(["#30333a", "#343741", "#808080", "#cccccc"]);
  if (!previous || !previous.color) return null;
  if (previous.painted) return previous.color;
  return legacyDefaultColors.has(String(previous.color).toLowerCase()) ? null : previous.color;
}

function getModelForLibraryAction(actionKey) {
  if (actionKey === "plain") return "scifi_floor_base_a_50_v01";
  if (actionKey === "corner") return "scifi_floor_base_b_50_v01";
  if (actionKey === "louver") return "scifi_floor_base_c_50_v01";
  if (actionKey === "modular") return "scifi_wall_base_a_50_v01";
  if (actionKey === "hatch") return "scifi_wall_base_b_50_v01";
  if (actionKey === "vent") return "scifi_wall_base_c_50_v01";
  if (PANEL_MODEL_BY_ACTION[actionKey]) return PANEL_MODEL_BY_ACTION[actionKey];
  return null;
}

function isPanelModel(modelId) {
  return PANEL_MODEL_IDS.has(modelId);
}

function getWallTileId(side, x, z, h) {
  if (side === "back") return `wall_back_${x}_h${h}`;
  if (side === "left") return `wall_left_${z}_h${h}`;
  if (side === "right") return `wall_right_${z}_h${h}`;
  return "";
}

function getWallLineKey(tile) {
  if (!tile || tile.type !== "wall") return "";
  return tile.side === "back" ? `${tile.side}:${tile.x}` : `${tile.side}:${tile.z}`;
}

function getPanelCellId(tile, axis, offset) {
  if (!tile) return "";
  if (tile.type === "floor") {
    if (axis === "x") return `floor_${tile.x + offset}_${tile.z}`;
    if (axis === "z") return `floor_${tile.x}_${tile.z + offset}`;
  }
  if (tile.type === "wall" && axis === "h") return getWallTileId(tile.side, tile.x, tile.z, tile.h + offset);
  return "";
}

function getPanelCoveredIds(tile, axis = tile ? tile.spanAxis : null) {
  if (!tile || !axis) return [];
  return Array.from({ length: PANEL_SPAN_H - 1 }, (_, index) => getPanelCellId(tile, axis, index + 1));
}

function findPanelAnchor(tiles, selectedIds) {
  const tileById = Object.fromEntries(tiles.map((tile) => [tile.id, tile]));
  const selectedTiles = selectedIds.map((id) => tileById[id]).filter((tile) => tile && !tile.coveredBy);
  if (selectedTiles.length === 1 && isPanelModel(selectedTiles[0].modelId)) return { anchor: selectedTiles[0], axis: selectedTiles[0].spanAxis || (selectedTiles[0].type === "wall" ? "h" : "z") };
  if (selectedTiles.length < PANEL_SPAN_H) return null;
  const selectedSet = new Set(selectedTiles.map((tile) => tile.id));
  const floorTiles = selectedTiles.filter((tile) => tile.type === "floor");
  if (floorTiles.length === selectedTiles.length) {
    const candidates = floorTiles.slice().sort((a, b) => a.z - b.z || a.x - b.x);
    for (const tile of candidates) {
      for (const axis of ["z", "x"]) {
        const coveredIds = getPanelCoveredIds(tile, axis);
        const ids = [tile.id].concat(coveredIds);
        const validLine = coveredIds.every((id) => {
          const coveredTile = tileById[id];
          return coveredTile && !coveredTile.coveredBy && coveredTile.type === "floor";
        });
        if (validLine && ids.every((id) => selectedSet.has(id))) return { anchor: tile, axis };
      }
    }
  }
  const wallTiles = selectedTiles.filter((tile) => tile.type === "wall");
  if (wallTiles.length === selectedTiles.length) {
    const candidates = wallTiles.slice().sort((a, b) => a.h - b.h);
    for (const tile of candidates) {
      const coveredIds = getPanelCoveredIds(tile, "h");
      const ids = [tile.id].concat(coveredIds);
      const sameLine = coveredIds.every((id) => {
        const coveredTile = tileById[id];
        return coveredTile && !coveredTile.coveredBy && getWallLineKey(coveredTile) === getWallLineKey(tile);
      });
      if (sameLine && ids.every((id) => selectedSet.has(id))) return { anchor: tile, axis: "h" };
    }
  }
  return null;
}

function applyPanelModelToTiles(tiles, selectedIds, modelId) {
  const panelPlacement = findPanelAnchor(tiles, selectedIds);
  if (!panelPlacement) return null;
  const { anchor, axis } = panelPlacement;
  const coveredIds = getPanelCoveredIds(anchor, axis);
  const affectedIds = new Set([anchor.id].concat(coveredIds));
  return {
    anchorId: anchor.id,
    tiles: tiles.map((tile) => {
      if (tile.id === anchor.id) return { ...tile, modelId, spanH: axis === "h" ? PANEL_SPAN_H : 1, spanAxis: axis, spanSize: PANEL_SPAN_H, coveredBy: null, rotation: 0, groupId: null };
      if (coveredIds.includes(tile.id)) return { ...tile, coveredBy: anchor.id, spanH: 1, spanAxis: null, spanSize: 1, groupId: null };
      if (affectedIds.has(tile.coveredBy)) return { ...tile, coveredBy: null };
      return tile;
    })
  };
}

function makeTiles(config, previousById = {}) {
  const tiles = [];
  for (let x = 0; x < config.width; x += 1) {
    for (let z = 0; z < config.depth; z += 1) {
      const id = `floor_${x}_${z}`;
      const previous = previousById[id] || {};
      const color = getStoredPaintColor(previous);
      tiles.push({ id, type: "floor", side: "floor", x, z, h: 0, modelId: previous.modelId || DEFAULT_MODEL_BY_TYPE.floor, color, painted: Boolean(color), rotation: previous.rotation || 0, flip: previous.flip || false, groupId: previous.groupId || null, spanH: 1, spanAxis: previous.spanAxis || null, spanSize: previous.spanSize || 1, coveredBy: previous.coveredBy || null });
    }
  }
  if (config.backWall) {
    for (let x = 0; x < config.width; x += 1) {
      for (let h = 0; h < config.height; h += 1) {
        const id = `wall_back_${x}_h${h}`;
        const previous = previousById[id] || {};
        const color = getStoredPaintColor(previous);
        const spanH = previous.spanH && h + previous.spanH <= config.height ? previous.spanH : 1;
        tiles.push({ id, type: "wall", side: "back", x, z: 0, h, modelId: previous.modelId || DEFAULT_MODEL_BY_TYPE.wall, color, painted: Boolean(color), rotation: previous.rotation || 0, flip: previous.flip || false, groupId: previous.groupId || null, spanH, spanAxis: previous.spanAxis || null, spanSize: previous.spanSize || 1, coveredBy: previous.coveredBy || null });
      }
    }
  }
  if (config.leftWall) {
    for (let z = 0; z < config.depth; z += 1) {
      for (let h = 0; h < config.height; h += 1) {
        const id = `wall_left_${z}_h${h}`;
        const previous = previousById[id] || {};
        const color = getStoredPaintColor(previous);
        const spanH = previous.spanH && h + previous.spanH <= config.height ? previous.spanH : 1;
        tiles.push({ id, type: "wall", side: "left", x: 0, z, h, modelId: previous.modelId || DEFAULT_MODEL_BY_TYPE.wall, color, painted: Boolean(color), rotation: previous.rotation || 0, flip: previous.flip || false, groupId: previous.groupId || null, spanH, spanAxis: previous.spanAxis || null, spanSize: previous.spanSize || 1, coveredBy: previous.coveredBy || null });
      }
    }
  }
  if (config.rightWall) {
    for (let z = 0; z < config.depth; z += 1) {
      for (let h = 0; h < config.height; h += 1) {
        const id = `wall_right_${z}_h${h}`;
        const previous = previousById[id] || {};
        const color = getStoredPaintColor(previous);
        const spanH = previous.spanH && h + previous.spanH <= config.height ? previous.spanH : 1;
        tiles.push({ id, type: "wall", side: "right", x: config.width - 1, z, h, modelId: previous.modelId || DEFAULT_MODEL_BY_TYPE.wall, color, painted: Boolean(color), rotation: previous.rotation || 0, flip: previous.flip || false, groupId: previous.groupId || null, spanH, spanAxis: previous.spanAxis || null, spanSize: previous.spanSize || 1, coveredBy: previous.coveredBy || null });
      }
    }
  }
  return tiles;
}

function getTileTransform(tile, config) {
  const rotationRad = THREE.MathUtils.degToRad(tile.rotation || 0);
  const halfW = (config.width * UNIT) / 2;
  const halfD = (config.depth * UNIT) / 2;
  const offset = TILE_THICKNESS / 2;
  const spanAxis = tile.spanAxis || (tile.type === "wall" ? "h" : "z");
  const spanSize = tile.spanSize || 1;
  const spanH = tile.spanH || 1;
  const wallY = (tile.h + spanH / 2) * UNIT;
  const panelSelection = [VISUAL_TILE_UNIT + 0.01, spanH * UNIT - 0.01, 0.026];
  if (tile.type === "floor" && isPanelModel(tile.modelId)) {
    const length = spanSize * UNIT;
    const position = spanAxis === "x"
      ? [(tile.x + spanSize / 2) * UNIT - halfW, TILE_THICKNESS / 2, (tile.z + 0.5) * UNIT - halfD]
      : [(tile.x + 0.5) * UNIT - halfW, TILE_THICKNESS / 2, (tile.z + spanSize / 2) * UNIT - halfD];
    return { position, rotation: [0, 0, 0], contentRotation: [0, (spanAxis === "x" ? Math.PI / 2 : 0) + rotationRad, 0], targetPlane: "XZ", size: [spanAxis === "x" ? length : VISUAL_TILE_UNIT, TILE_THICKNESS, spanAxis === "z" ? length : VISUAL_TILE_UNIT], hitbox: [spanAxis === "x" ? length : UNIT, 0.16, spanAxis === "z" ? length : UNIT], selectionSize: [spanAxis === "x" ? length - 0.01 : VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, spanAxis === "z" ? length - 0.01 : VISUAL_TILE_UNIT + 0.01] };
  }
  if (tile.type === "floor") return { position: [(tile.x + 0.5) * UNIT - halfW, TILE_THICKNESS / 2, (tile.z + 0.5) * UNIT - halfD], rotation: [0, 0, 0], contentRotation: [0, rotationRad, 0], targetPlane: "XZ", size: [VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT], hitbox: [UNIT, 0.16, UNIT], selectionSize: [VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, VISUAL_TILE_UNIT + 0.01] };
  if (isPanelModel(tile.modelId)) {
    if (tile.side === "back") return { position: [(tile.x + 0.5) * UNIT - halfW, wallY, -halfD - offset], rotation: [0, 0, 0], contentRotation: [0, 0, rotationRad], targetPlane: "XY", size: [VISUAL_TILE_UNIT, spanH * UNIT, TILE_THICKNESS], hitbox: [UNIT, spanH * UNIT, 0.16], selectionSize: panelSelection };
    if (tile.side === "left") return { position: [-halfW - offset, wallY, (tile.z + 0.5) * UNIT - halfD], rotation: [0, -Math.PI / 2, 0], contentRotation: [0, 0, rotationRad], targetPlane: "XY", size: [VISUAL_TILE_UNIT, spanH * UNIT, TILE_THICKNESS], hitbox: [UNIT, spanH * UNIT, 0.16], selectionSize: panelSelection };
    if (tile.side === "right") return { position: [halfW + offset, wallY, (tile.z + 0.5) * UNIT - halfD], rotation: [0, Math.PI / 2, 0], contentRotation: [0, 0, rotationRad], targetPlane: "XY", size: [VISUAL_TILE_UNIT, spanH * UNIT, TILE_THICKNESS], hitbox: [UNIT, spanH * UNIT, 0.16], selectionSize: panelSelection };
  }
  if (tile.side === "back") return { position: [(tile.x + 0.5) * UNIT - halfW, wallY, -halfD - offset], rotation: [Math.PI / 2, getWallRotationY(tile.side), 0], rotationOrder: "YXZ", contentRotation: [0, rotationRad, 0], size: [VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT], hitbox: [UNIT, 0.16, UNIT], selectionSize: [VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, VISUAL_TILE_UNIT + 0.01] };
  if (tile.side === "left") return { position: [-halfW - offset, wallY, (tile.z + 0.5) * UNIT - halfD], rotation: [Math.PI / 2, getWallRotationY(tile.side), 0], rotationOrder: "YXZ", contentRotation: [0, rotationRad, 0], size: [VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT], hitbox: [UNIT, 0.16, UNIT], selectionSize: [VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, VISUAL_TILE_UNIT + 0.01] };
  if (tile.side === "right") return { position: [halfW + offset, wallY, (tile.z + 0.5) * UNIT - halfD], rotation: [Math.PI / 2, getWallRotationY(tile.side), 0], rotationOrder: "YXZ", contentRotation: [0, rotationRad, 0], size: [VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT], hitbox: [UNIT, 0.16, UNIT], selectionSize: [VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, VISUAL_TILE_UNIT + 0.01] };
  return { position: [0, 0, 0], rotation: [0, 0, 0], contentRotation: [0, 0, 0], size: [VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT], hitbox: [UNIT, 0.16, UNIT] };
}

function countByModel(tiles) {
  const result = {};
  tiles.forEach((tile) => {
    if (tile.coveredBy) return;
    result[tile.modelId] = (result[tile.modelId] || 0) + 1;
  });
  return result;
}

function buildPrintList(config, tiles) {
  const counts = countByModel(tiles);
  const floorConnectors = Math.max(0, (config.width - 1) * config.depth + (config.depth - 1) * config.width);
  const wallTiles = (config.backWall ? config.width * config.height : 0) + (config.leftWall ? config.depth * config.height : 0) + (config.rightWall ? config.depth * config.height : 0);
  const sideTrims = (config.leftWall ? config.depth : 0) + (config.rightWall ? config.depth : 0);
  counts.scifi_connector_floor_h_v01 = (counts.scifi_connector_floor_h_v01 || 0) + floorConnectors;
  counts.scifi_trim_front_50_v01 = (counts.scifi_trim_front_50_v01 || 0) + config.width;
  if (wallTiles > 0) counts.scifi_connector_wall_clip_v01 = (counts.scifi_connector_wall_clip_v01 || 0) + wallTiles;
  if (sideTrims > 0) counts.scifi_trim_side_50_v01 = (counts.scifi_trim_side_50_v01 || 0) + sideTrims;
  const grouped = { floor: [], wall: [], connector: [], trim: [], accessory: [] };
  Object.keys(counts).forEach((assetId) => {
    const asset = ASSET_BY_ID[assetId];
    const quantity = counts[assetId];
    if (!asset || quantity < 1) return;
    grouped[asset.category].push({ quantity, asset });
  });
  Object.keys(grouped).forEach((category) => grouped[category].sort((a, b) => a.asset.name.localeCompare(b.asset.name)));
  return grouped;
}

function makeBuildText(config, printList) {
  const sections = ["MODULAR DIORAMA CONFIGURATOR", "================================", "", "Configuration", "Theme: " + config.theme, "Scale: " + config.scale, "Grid: " + config.width + " x " + config.depth + " x " + config.height + " modules", "Module size: " + MODULE_MM + " mm", "Width: " + config.width * MODULE_MM + " mm", "Depth: " + config.depth * MODULE_MM + " mm", "Height: " + config.height * MODULE_MM + " mm", "Back Wall: " + (config.backWall ? "Yes" : "No"), "Left Wall: " + (config.leftWall ? "Yes" : "No"), "Right Wall: " + (config.rightWall ? "Yes" : "No"), "", "Print List", "----------"];
  const labels = { floor: "Floors", wall: "Walls", connector: "Connectors", trim: "Trims", accessory: "Accessories" };
  Object.keys(labels).forEach((category) => {
    sections.push("", labels[category]);
    const items = printList[category] || [];
    if (items.length === 0) sections.push("- None");
    items.forEach((entry) => {
      const asset = entry.asset;
      sections.push("- " + entry.quantity + "x " + asset.name, "  STL: " + asset.file_stl, "  3MF: " + asset.file_3mf, "  Orientation: " + asset.print_orientation, "  Supports: " + (asset.supports ? "Yes" : "No"), "  Bed texture finish: " + (asset.bed_texture_finish ? "Yes" : "No"), "  Notes: " + asset.notes);
    });
  });
  return sections.join("\n");
}

function createTextSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 48px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.42, 0.105, 1);
  return sprite;
}

function makeMediumGrayMaterial(material, color = MODEL_BASE_COLOR) {
  if (Array.isArray(material)) return material.map((entry) => makeMediumGrayMaterial(entry, color));
  const next = new THREE.MeshStandardMaterial({
    color,
    roughness: material && typeof material.roughness === "number" ? material.roughness : 0.78,
    metalness: material && typeof material.metalness === "number" ? material.metalness : 0.08,
    side: THREE.DoubleSide
  });
  if (next.emissive) {
    next.emissive.set("#000000");
    next.emissiveIntensity = 0;
  }
  return next;
}

function setObjectTransform(object, transform) {
  object.position.set(transform.position[0], transform.position[1], transform.position[2]);
  object.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotationOrder || "XYZ");
}

function setContentRotation(object, transform) {
  const rotation = transform.contentRotation || [0, 0, 0];
  object.rotation.set(rotation[0], rotation[1], rotation[2]);
}

function makeSelectionEdges(size = [VISUAL_TILE_UNIT + 0.01, TILE_THICKNESS + 0.006, VISUAL_TILE_UNIT + 0.01]) {
  const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0], size[1], size[2]));
  const material = new THREE.LineBasicMaterial({ color: "#ff2d2d", depthTest: true, depthWrite: false });
  const edges = new THREE.LineSegments(geometry, material);
  edges.raycast = function () {};
  return edges;
}

function makeVariantGroup(variant) {
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: MODEL_BASE_COLOR, roughness: 0.9 });
  if (variant === "base_b") {
    [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].forEach(([x, z]) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.08), dark.clone());
      mesh.position.set(x, TILE_THICKNESS + 0.003, z);
      group.add(mesh);
    });
  }
  if (variant === "base_c") {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.006, 0.015), dark.clone());
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.006, 0.46), dark.clone());
    a.position.y = TILE_THICKNESS + 0.003;
    b.position.y = TILE_THICKNESS + 0.003;
    group.add(a, b);
  }
  return group;
}

function ThreeViewport({ config, tiles, selectedIds, onSelectTile, clearSelection, showRuler, showGrid }) {
  const hostRef = useRef(null);
  const dataRef = useRef({ config, tiles, selectedIds, onSelectTile, clearSelection, showRuler, showGrid });
  const viewportApiRef = useRef(null);

  useEffect(() => {
    dataRef.current = { config, tiles, selectedIds, onSelectTile, clearSelection, showRuler, showGrid };
  }, [config, tiles, selectedIds, onSelectTile, clearSelection, showRuler, showGrid]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog("#d6d5d1", 5, 12);
    let disposed = false;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor("#d6d5d1", 0);
    renderer.shadowMap.enabled = false;
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight("#ffffff", 0.72);
    const key = new THREE.DirectionalLight("#ffffff", 1.3);
    key.position.set(4, 6, 5);
    key.castShadow = false;
    const fill = new THREE.DirectionalLight("#ffffff", 0.35);
    fill.position.set(-3, 3, -3);
    scene.add(ambient, key, fill);

    const tileRoot = new THREE.Group();
    const rulerRoot = new THREE.Group();
    const gridRoot = new THREE.Group();
    scene.add(gridRoot, tileRoot, rulerRoot);
    const gltfModels = {};

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitboxes = [];
    const controls = { theta: 0.72, phi: 1.08, radius: 4.2, target: new THREE.Vector3(0, 0.45, 0), dragging: false, panning: false, x: 0, y: 0, moved: false };

    function updateCamera() {
      const sinPhi = Math.sin(controls.phi);
      camera.position.set(controls.target.x + controls.radius * sinPhi * Math.sin(controls.theta), controls.target.y + controls.radius * Math.cos(controls.phi), controls.target.z + controls.radius * sinPhi * Math.cos(controls.theta));
      camera.lookAt(controls.target);
    }

    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function disposeObject(object) {
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose && m.dispose());
          else child.material.dispose && child.material.dispose();
        }
      });
    }

    function clearGroup(group) {
      while (group.children.length) {
        const child = group.children.pop();
        disposeObject(child);
      }
    }

    function buildGrid(visible) {
      clearGroup(gridRoot);
      if (!visible) return;
      const size = 12;
      const divisions = 24;
      const grid = new THREE.GridHelper(size, divisions, "#aeb4b8", "#c5c9cb");
      grid.position.y = -0.005;
      gridRoot.add(grid);
    }

    function line(points, color) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
      const material = new THREE.LineBasicMaterial({ color });
      return new THREE.Line(geometry, material);
    }

    function makeSphere(position, color) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), new THREE.MeshBasicMaterial({ color }));
      mesh.position.set(position[0], position[1], position[2]);
      return mesh;
    }

    function buildRulers(currentConfig, visible) {
      clearGroup(rulerRoot);
      if (!visible) return;
      const width = currentConfig.width * UNIT;
      const depth = currentConfig.depth * UNIT;
      const height = currentConfig.height * UNIT;
      const blue = "#60a5fa";
      const hasWall = currentConfig.backWall || currentConfig.leftWall || currentConfig.rightWall;
      const widthA = [-width / 2, 0.055, depth / 2 + 0.2];
      const widthB = [width / 2, 0.055, depth / 2 + 0.2];
      const depthA = [width / 2 + 0.2, 0.055, -depth / 2];
      const depthB = [width / 2 + 0.2, 0.055, depth / 2];
      rulerRoot.add(line([widthA, widthB], blue), makeSphere(widthA, blue), makeSphere(widthB, blue));
      const widthText = createTextSprite(currentConfig.width * MODULE_MM + " mm", blue);
      widthText.position.set(0, 0.12, depth / 2 + 0.2);
      rulerRoot.add(widthText);
      rulerRoot.add(line([depthA, depthB], blue), makeSphere(depthA, blue), makeSphere(depthB, blue));
      const depthText = createTextSprite(currentConfig.depth * MODULE_MM + " mm", blue);
      depthText.position.set(width / 2 + 0.28, 0.12, 0);
      rulerRoot.add(depthText);
      if (hasWall) {
        const backPlaneZ = -depth / 2 - 0.13;
        const heightA = [-width / 2 - 0.18, 0, backPlaneZ];
        const heightB = [-width / 2 - 0.18, height, backPlaneZ];
        rulerRoot.add(line([heightA, heightB], blue), makeSphere(heightA, blue), makeSphere(heightB, blue));
        const heightText = createTextSprite(currentConfig.height * MODULE_MM + " mm", blue);
        heightText.position.set(-width / 2 - 0.28, height / 2, backPlaneZ);
        rulerRoot.add(heightText);
      }
    }

    function normalizePanelGeometry(geometry, targetPlane) {
      geometry.computeBoundingBox();
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const axes = [
        { key: "x", value: Math.abs(size.x) },
        { key: "y", value: Math.abs(size.y) },
        { key: "z", value: Math.abs(size.z) }
      ].sort((a, b) => a.value - b.value);
      const thinAxis = axes[0].key;
      if (targetPlane === "XY" && thinAxis === "y") geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      if (targetPlane === "XY" && thinAxis === "x") geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
      if (targetPlane === "XZ" && thinAxis === "z") geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
    }

    function makeTileModel(modelId, color, transform) {
      const source = gltfModels[modelId];
      if (!source) return null;
      const model = source.clone(true);
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry = child.geometry.clone();
        if (isPanelModel(modelId)) normalizePanelGeometry(child.geometry, transform ? transform.targetPlane : "XY");
        if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
        child.material = makeMediumGrayMaterial(child.material, color);
        child.castShadow = false;
        child.receiveShadow = false;
        child.raycast = function () {};
      });
      return model;
    }

    function buildTiles(currentConfig, currentTiles, currentSelected) {
      clearGroup(tileRoot);
      hitboxes.length = 0;
      currentTiles.forEach((tile) => {
        if (tile.coveredBy) return;
        const transform = getTileTransform(tile, currentConfig);
        const asset = ASSET_BY_ID[tile.modelId];
        const selected = currentSelected.includes(tile.id);
        const paintColor = tile.painted ? tile.color : getStoredPaintColor(tile);
        const displayColor = paintColor || MODEL_BASE_COLOR;
        const group = new THREE.Group();
        const content = new THREE.Group();
        setObjectTransform(group, transform);
        setContentRotation(content, transform);
        if (tile.flip) content.scale.x = -1;
        const model = makeTileModel(tile.modelId, displayColor, transform);
        if (model) content.add(model);
        else {
          const material = new THREE.MeshStandardMaterial({ color: displayColor, roughness: 0.78, metalness: 0.08, emissive: new THREE.Color("#000000"), emissiveIntensity: 0 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(VISUAL_TILE_UNIT, TILE_THICKNESS, VISUAL_TILE_UNIT), material);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.raycast = function () {};
          content.add(mesh);
          const variantGroup = makeVariantGroup(asset ? asset.variant : "base_a");
          variantGroup.traverse((child) => { child.raycast = function () {}; });
          content.add(variantGroup);
        }
        if (selected) {
          content.add(makeSelectionEdges(transform.selectionSize));
        }
        const hitbox = new THREE.Mesh(new THREE.BoxGeometry(transform.hitbox[0], transform.hitbox[1], transform.hitbox[2]), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hitbox.userData.tileId = tile.id;
        content.add(hitbox);
        group.add(content);
        hitboxes.push(hitbox);
        tileRoot.add(group);
      });
    }

    function rebuild() {
      const current = dataRef.current;
      buildGrid(current.showGrid);
      buildTiles(current.config, current.tiles, current.selectedIds);
      buildRulers(current.config, current.showRuler);
    }
    viewportApiRef.current = { rebuild };

    const gltfLoader = new GLTFLoader();
    Promise.all(Object.entries(GLTF_MODEL_BY_ID).map(async ([modelId, url]) => {
      try {
        const gltf = await gltfLoader.loadAsync(url);
        gltfModels[modelId] = gltf.scene;
        gltfModels[modelId].traverse((child) => {
          if (!child.isMesh) return;
          child.raycast = function () {};
        });
      } catch (error) {
        console.warn("Could not load model", modelId, url, error);
      }
    })).then(() => {
      if (disposed) return;
      rebuild();
    });

    function setPointer(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function pointerDown(event) {
      controls.dragging = true;
      controls.panning = event.button === 2 || event.altKey;
      controls.x = event.clientX;
      controls.y = event.clientY;
      controls.moved = false;
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function pointerMove(event) {
      if (!controls.dragging) return;
      const dx = event.clientX - controls.x;
      const dy = event.clientY - controls.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) controls.moved = true;
      controls.x = event.clientX;
      controls.y = event.clientY;
      if (controls.panning) {
        const panScale = controls.radius * 0.0015;
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
        controls.target.addScaledVector(right, -dx * panScale);
        controls.target.addScaledVector(up, dy * panScale);
      } else {
        controls.theta -= dx * 0.006;
        controls.phi = clamp(controls.phi - dy * 0.006, 0.18, Math.PI / 2 - 0.02);
      }
      updateCamera();
    }

    function pointerUp(event) {
      if (!controls.dragging) return;
      controls.dragging = false;
      try { renderer.domElement.releasePointerCapture(event.pointerId); } catch (error) {}
      if (controls.moved) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitboxes, false);
      if (hits.length) {
        const tileId = hits[0].object.userData.tileId;
        dataRef.current.onSelectTile(tileId, event.shiftKey || event.ctrlKey || event.metaKey);
      } else {
        dataRef.current.clearSelection();
      }
    }

    function wheel(event) {
      event.preventDefault();
      controls.radius = clamp(controls.radius + event.deltaY * 0.0025, 1.1, 8);
      updateCamera();
    }

    function contextMenu(event) { event.preventDefault(); }

    buildGrid(dataRef.current.showGrid);
    resize();
    updateCamera();
    buildRulers(dataRef.current.config, dataRef.current.showRuler);

    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    renderer.domElement.addEventListener("contextmenu", contextMenu);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      renderer.domElement.removeEventListener("contextmenu", contextMenu);
      viewportApiRef.current = null;
      clearGroup(tileRoot);
      clearGroup(rulerRoot);
      clearGroup(gridRoot);
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    viewportApiRef.current?.rebuild();
  }, [config, tiles, selectedIds, showRuler, showGrid]);

  return <div ref={hostRef} className="threeHost" />;
}

function runLogicTests() {
  const config = { ...DEFAULT_CONFIG };
  const tiles = makeTiles(config);
  const floors = tiles.filter((tile) => tile.type === "floor");
  const backWalls = tiles.filter((tile) => tile.side === "back");
  const printList = buildPrintList(config, tiles);
  const floorConnector = printList.connector.find((item) => item.asset.id === "scifi_connector_floor_h_v01");
  const wallConnector = printList.connector.find((item) => item.asset.id === "scifi_connector_wall_clip_v01");
  const backTransform = getTileTransform(backWalls[0], config);
  const panelResult = applyPanelModelToTiles(tiles, ["wall_back_0_h0", "wall_back_0_h1", "wall_back_0_h2"], "scifi_wall_panel_light_1x3_v01");
  const panelAnchor = panelResult ? panelResult.tiles.find((tile) => tile.id === "wall_back_0_h0") : null;
  const panelCounts = panelResult ? countByModel(panelResult.tiles) : {};
  const floorPanelResult = applyPanelModelToTiles(tiles, ["floor_0_0", "floor_1_0", "floor_2_0"], "scifi_wall_panel_hatch_1x3_v01");
  const floorPanelAnchor = floorPanelResult ? floorPanelResult.tiles.find((tile) => tile.id === "floor_0_0") : null;
  console.assert(floors.length === 9, "Expected 9 floor tiles in the default 3x3 scene");
  console.assert(backWalls.length === 9, "Expected 9 back wall tiles in the default scene");
  console.assert(getModelForLibraryAction("corner") === "scifi_floor_base_b_50_v01", "Corner Slots must map to Floor Base B");
  console.assert(getModelForLibraryAction("louver") === "scifi_floor_base_c_50_v01", "Louver must map to Floor Base C");
  console.assert(getModelForLibraryAction("modular") === "scifi_wall_base_a_50_v01", "Wall Light must map to Wall Base A");
  console.assert(getModelForLibraryAction("hatch") === "scifi_wall_base_b_50_v01", "Hatch must map to Wall Base B");
  console.assert(getModelForLibraryAction("vent") === "scifi_wall_base_c_50_v01", "Vent must map to Wall Base C");
  console.assert(getModelForLibraryAction("panel_light") === "scifi_wall_panel_light_1x3_v01", "Panel Light must map to the 1x3 Wall Panel Light");
  console.assert(getModelForLibraryAction("panel_hatch") === "scifi_wall_panel_hatch_1x3_v01", "Panel Hatch must map to the 1x3 Wall Panel Hatch");
  console.assert(getModelForLibraryAction("panel_vent") === "scifi_wall_panel_vent_1x3_v01", "Panel Vent must map to the 1x3 Wall Panel Vent");
  console.assert(panelAnchor && panelAnchor.spanH === 3, "A 1x3 panel must occupy three vertical wall modules");
  console.assert(panelCounts.scifi_wall_panel_light_1x3_v01 === 1, "A 1x3 panel must count as one printed wall panel");
  console.assert(floorPanelAnchor && floorPanelAnchor.spanAxis === "x", "A 1x3 panel must also apply to three floor modules in a line");
  console.assert(floorConnector && floorConnector.quantity === 12, "Expected 12 floor connectors for a 3x3 floor grid");
  console.assert(wallConnector && wallConnector.quantity === 9, "Expected 9 wall connectors for a 3x3 back wall");
  console.assert(backTransform.rotation[0] === Math.PI / 2, "Back wall tile must be vertical and face inward");
  console.assert(backTransform.position[1] === 0.25, "First back wall tile must start at half-module height");
}

if (typeof window !== "undefined" && !window.__MODULAR_DIORAMA_THREE_VANILLA_TESTS__) {
  window.__MODULAR_DIORAMA_THREE_VANILLA_TESTS__ = true;
  runLogicTests();
}

function MiniIcon({ Icon }) { return <Icon className="miniIcon" aria-hidden="true" strokeWidth={2} />; }

function Tag({ children, active }) { return <span className={active ? "tag active" : "tag"}>{children}</span>; }

function LeftPanel({ activeTab, setActiveTab, printList, onCopy, onDownload }) {
  const labels = { floor: "Floors", wall: "Walls", connector: "Connectors", trim: "Trims", accessory: "Accessories" };
  return <aside className="leftPanel"><div className="panelHeader"><div className="panelTitle">Diorama Configurator</div><div className="panelSub">Printable modular 3D scene builder</div><div className="tabs"><button className={activeTab === "print" ? "tab active" : "tab"} onClick={() => setActiveTab("print")}>Print List</button><button className={activeTab === "assets" ? "tab active" : "tab"} onClick={() => setActiveTab("assets")}>Assets</button></div></div><div className="panelScroll">{activeTab === "print" ? Object.keys(labels).map((category) => { const items = printList[category] || []; const total = items.reduce((sum, item) => sum + item.quantity, 0); return <section className="printGroup" key={category}><div className="groupHeader"><span>{labels[category]}</span><span>{total} pcs</span></div><div className="groupBody">{items.length === 0 ? <div className="emptyLine">No parts required.</div> : null}{items.map((entry) => <div className="partCard" key={entry.asset.id}><div className="partName"><b>{entry.quantity}×</b> {entry.asset.name}</div><div className="fileName">{entry.asset.file_stl}</div><div className="tagRow"><Tag active={entry.asset.print_orientation === "Face-down"}>{entry.asset.print_orientation}</Tag><Tag active={!entry.asset.supports}>{entry.asset.supports ? "Supports" : "No supports"}</Tag>{entry.asset.bed_texture_finish ? <Tag active>Bed texture finish</Tag> : null}</div></div>)}</div></section>; }) : <div className="assetList">{CATALOG.map((asset) => <div className="assetCard" key={asset.id}><div className="assetName">{asset.name}</div><div className="assetId">{asset.id}</div><div className="tagRow"><Tag>{asset.category}</Tag><Tag>{asset.variant}</Tag></div></div>)}</div>}</div><div className="panelFooter twoButtons"><button className="panelButton" onClick={onCopy}>Copy Build List</button><button className="panelButton" onClick={onDownload}>Download TXT</button></div></aside>;
}

function Stepper({ label, value, min, max, onChange }) {
  return <div className="stepperRow"><div><div className="fieldTitle">{label}</div><div className="fieldHint">50mm module</div></div><div className="stepper"><button onClick={() => onChange(clamp(value - 1, min, max))}>−</button><span>{value}</span><button onClick={() => onChange(clamp(value + 1, min, max))}>+</button></div></div>;
}

function Toggle({ label, value, onChange }) {
  return <div className="toggleRow"><span>{label}</span><button className={value ? "toggle on" : "toggle"} onClick={() => onChange(!value)}>{value ? "Yes" : "No"}</button></div>;
}

function RightPanel({ config, setConfig, activeColor, setActiveColor, selectionCount, onReset, onShare, onExport }) {
  return <aside className="rightPanel"><div className="panelHeader inspectorHeader"><div><div className="panelTitle">Inspector</div><div className="panelSub">{selectionCount} selected tile{selectionCount === 1 ? "" : "s"}</div></div><button className="iconButton" onClick={onReset} title="Reset Configuration">↺</button></div><div className="panelScroll settingsScroll"><section className="settingsBlock"><div className="settingsTitle">Tool Color</div><div className="colorRow"><input type="color" value={activeColor} onChange={(event) => setActiveColor(event.target.value)} /><span>{activeColor}</span></div></section><section className="settingsBlock"><div className="settingsTitle">Global Settings</div><label className="label">Theme</label><select value={config.theme} onChange={(event) => setConfig({ theme: event.target.value })}><option>Sci-Fi</option><option>Urban</option><option>Industrial</option></select><label className="label withTop">Scale</label><select value={config.scale} onChange={(event) => setConfig({ scale: event.target.value })}><option>1:12</option><option>1:10</option><option>Custom</option></select></section><section className="settingsBlock stack"><div className="settingsTitle">Grid</div><Stepper label="Width" value={config.width} min={1} max={10} onChange={(value) => setConfig({ width: value })} /><Stepper label="Depth" value={config.depth} min={1} max={10} onChange={(value) => setConfig({ depth: value })} /><Stepper label="Height" value={config.height} min={1} max={8} onChange={(value) => setConfig({ height: value })} /><div className="sizeBox">Size: <b>{config.width * MODULE_MM} mm</b> × <b>{config.depth * MODULE_MM} mm</b> × <b>{config.height * MODULE_MM} mm</b></div></section><section className="settingsBlock stack"><div className="settingsTitle">Walls</div><Toggle label="Back Wall" value={config.backWall} onChange={(value) => setConfig({ backWall: value })} /><Toggle label="Left Wall" value={config.leftWall} onChange={(value) => setConfig({ leftWall: value })} /><Toggle label="Right Wall" value={config.rightWall} onChange={(value) => setConfig({ rightWall: value })} /></section></div><div className="panelFooter twoButtons"><button className="panelButton" onClick={onShare}>Share</button><button className="panelButton primary" onClick={onExport}>Export</button></div></aside>;
}

function Toolbar({ activeTool, setActiveTool, showLibrary, setShowLibrary, showRuler, setShowRuler, showGrid, setShowGrid, onGroup, onRotate, onFlip, onPaint }) {
  function runTool(toolKey) {
    if (toolKey === "library") { setShowLibrary((value) => !value); return; }
    if (toolKey === "group") { onGroup(); setActiveTool("select"); return; }
    if (toolKey === "rotate") { setActiveTool("rotate"); onRotate(); return; }
    if (toolKey === "flip") { setActiveTool("flip"); onFlip(); return; }
    if (toolKey === "paint") { setActiveTool("paint"); onPaint(); return; }
    if (toolKey === "ruler") { setShowRuler((value) => !value); return; }
    if (toolKey === "grid") { setShowGrid((value) => !value); return; }
    setActiveTool(toolKey);
  }
  return <div className="floatingToolbar">{TOOLBAR.map((tool) => <button key={tool.key} title={tool.label} className={cx("toolButton", activeTool === tool.key ? "active" : "", tool.key === "library" && showLibrary ? "active" : "", tool.key === "ruler" && showRuler ? "active" : "", tool.key === "grid" && showGrid ? "active" : "")} onClick={() => runTool(tool.key)}><MiniIcon Icon={tool.Icon} /></button>)}</div>;
}

function LibraryPopup({ show, onApply }) {
  if (!show) return null;
  const groups = [
    { key: "floor", label: "Floor", items: LIBRARY_ITEMS.filter((item) => item.family === "floor") },
    { key: "wall", label: "Wall", items: LIBRARY_ITEMS.filter((item) => item.family === "wall") }
  ];
  return <div className="libraryPopup">{groups.map((group) => <div className="libraryGroup" key={group.key}><div className="libraryGroupTitle">{group.label}</div><div className={cx("libraryGroupItems", group.key === "wall" ? "wallItems" : "")}>{group.items.map((item) => <button className="libraryItem" key={item.key} onClick={() => onApply(item.key)} title={item.label}><span className="libraryIcon" style={{ "--icon-url": `url("${item.iconSrc}")` }} /><span>{item.label}</span></button>)}</div></div>)}</div>;
}

function Viewport({ config, tiles, setTiles, selectedIds, setSelectedIds, activeColor, showRuler, setShowRuler, showGrid, setShowGrid }) {
  const [activeTool, setActiveTool] = useState("select");
  const [showLibrary, setShowLibrary] = useState(false);
  const groupCounter = useRef(1);

  function onSelectTile(tileId, additive) {
    setSelectedIds((previous) => {
      const tile = tiles.find((entry) => entry.id === tileId);
      const groupIds = tile && tile.groupId ? tiles.filter((entry) => entry.groupId === tile.groupId).map((entry) => entry.id) : [tileId];
      if (!additive) return groupIds;
      const fullGroupSelected = groupIds.every((id) => previous.includes(id));
      if (fullGroupSelected) return previous.filter((id) => !groupIds.includes(id));
      return Array.from(new Set(previous.concat(groupIds)));
    });
  }

  function clearSelection() { setSelectedIds([]); }

  function applyLibraryModel(actionKey) {
    if (selectedIds.length === 0) return;
    const modelId = getModelForLibraryAction(actionKey);
    if (!modelId) {
      console.warn("No prototype model assigned for", actionKey);
      return;
    }
    if (isPanelModel(modelId)) {
      const result = applyPanelModelToTiles(tiles, selectedIds, modelId);
      if (!result) {
        console.warn("Select three visible wall tiles in the same vertical line before applying a 1x3 panel.");
        return;
      }
      setTiles(result.tiles);
      setSelectedIds([result.anchorId]);
      return;
    }
    setTiles((previous) => previous.map((tile) => {
      const selected = selectedIds.includes(tile.id);
      const releasedBySelection = selectedIds.includes(tile.coveredBy);
      if (selected) return { ...tile, modelId, spanH: 1, spanAxis: null, spanSize: 1, coveredBy: null };
      if (releasedBySelection) return { ...tile, coveredBy: null };
      return tile;
    }));
  }

  function paintSelected() { if (selectedIds.length === 0) return; setTiles((previous) => previous.map((tile) => selectedIds.includes(tile.id) ? { ...tile, color: activeColor, painted: true } : tile)); }
  function rotateSelected() { if (selectedIds.length === 0) return; setTiles((previous) => previous.map((tile) => {
    if (!selectedIds.includes(tile.id)) return tile;
    const rotationStep = isPanelModel(tile.modelId) ? 180 : 90;
    return { ...tile, rotation: (tile.rotation + rotationStep) % 360 };
  })); }
  function flipSelected() { if (selectedIds.length === 0) return; setTiles((previous) => previous.map((tile) => selectedIds.includes(tile.id) ? { ...tile, flip: !tile.flip } : tile)); }

  function groupSelected() {
    if (selectedIds.length === 0) return;
    const selectedTiles = tiles.filter((tile) => selectedIds.includes(tile.id));
    const selectedGroupIds = Array.from(new Set(selectedTiles.map((tile) => tile.groupId).filter(Boolean)));
    const singleSelectedGroup = selectedGroupIds.length === 1 && selectedTiles.every((tile) => tile.groupId === selectedGroupIds[0]);
    const nextGroupId = singleSelectedGroup ? null : "group_" + groupCounter.current;
    setTiles((previous) => previous.map((tile) => {
      if (singleSelectedGroup && tile.groupId === selectedGroupIds[0]) return { ...tile, groupId: null };
      if (!singleSelectedGroup && selectedIds.includes(tile.id)) return { ...tile, groupId: nextGroupId };
      return tile;
    }));
    if (!singleSelectedGroup) groupCounter.current += 1;
    setActiveTool("select");
  }

  return <main className="viewport"><Toolbar activeTool={activeTool} setActiveTool={setActiveTool} showLibrary={showLibrary} setShowLibrary={setShowLibrary} showRuler={showRuler} setShowRuler={setShowRuler} showGrid={showGrid} setShowGrid={setShowGrid} onGroup={groupSelected} onRotate={rotateSelected} onFlip={flipSelected} onPaint={paintSelected} /><LibraryPopup show={showLibrary} onApply={applyLibraryModel} /><div className="viewportBadge">{config.width * MODULE_MM} × {config.depth * MODULE_MM} × {config.height * MODULE_MM} mm</div><ThreeViewport config={config} tiles={tiles} selectedIds={selectedIds} onSelectTile={onSelectTile} clearSelection={clearSelection} showRuler={showRuler} showGrid={showGrid} /><div className="mouseHelp">Left drag: orbit · Wheel: zoom · Right drag: pan · Shift/Ctrl click: multi-select</div><div className="viewSwitch"><button className="active">Perspective</button><button>Orthographic</button></div></main>;
}

export default function App() {
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("print");
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showRuler, setShowRuler] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tiles, setTiles] = useState(() => makeTiles(DEFAULT_CONFIG));

  function updateConfig(patch) {
    setConfigState((previousConfig) => {
      const nextConfig = { ...previousConfig, ...patch };
      setTiles((previousTiles) => {
        const previousById = Object.fromEntries(previousTiles.map((tile) => [tile.id, tile]));
        const nextTiles = makeTiles(nextConfig, previousById);
        const validIds = new Set(nextTiles.map((tile) => tile.id));
        setSelectedIds((previousIds) => previousIds.filter((id) => validIds.has(id)));
        return nextTiles;
      });
      return nextConfig;
    });
  }

  const printList = useMemo(() => buildPrintList(config, tiles), [config, tiles]);
  const buildText = useMemo(() => makeBuildText(config, printList), [config, printList]);

  function downloadTxt() {
    const blob = new Blob([buildText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modular-diorama-build-list.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function copyBuildList() {
    try { await navigator.clipboard.writeText(buildText); }
    catch (error) { console.warn("Clipboard copy failed", error); }
  }

  async function shareBuildList() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Modular Diorama Build List", text: buildText });
        return;
      }
      await navigator.clipboard.writeText(buildText);
    } catch (error) {
      console.warn("Share failed", error);
    }
  }

  function resetConfiguration() {
    setConfigState(DEFAULT_CONFIG);
    setTiles(makeTiles(DEFAULT_CONFIG));
    setSelectedIds([]);
    setShowRuler(true);
    setShowGrid(true);
  }

  return <div className="appShell"><style>{`
    :root { --bg: #d7d8d4; --viewport: #d9dad6; --panel: rgba(239, 238, 232, 0.74); --panel2: rgba(255,255,255,0.38); --border: rgba(36,38,42,0.14); --text: #25262a; --muted: #71757b; --blue: #24262b; --blue2: #111216; --measure: #566879; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); }
    button, select, input { font: inherit; }
    button { cursor: pointer; }
    .appShell { width: 100vw; height: 100vh; overflow: hidden; display: flex; flex-direction: column; background: linear-gradient(135deg, #cfd3d6 0%, #d9dad6 42%, #c9c5bd 100%); color: var(--text); font-family: Inter, "SF Pro Display", "Helvetica Neue", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-optical-sizing: auto; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
    .mainLayout { position: relative; flex: 1; min-height: 0; display: block; overflow: hidden; }
    .panelButton:hover, .iconButton:hover { border-color: rgba(28,29,32,0.24); color: #15161a; background: rgba(255,255,255,0.56); }
    .leftPanel, .rightPanel { position: absolute; z-index: 20; top: 16px; bottom: 16px; min-height: 0; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.52); border-radius: 30px; background: var(--panel); -webkit-backdrop-filter: blur(22px) saturate(125%); backdrop-filter: blur(22px) saturate(125%); box-shadow: 0 28px 70px rgba(75,72,68,0.24), 0 7px 18px rgba(54,55,58,0.12), inset 0 1px 0 rgba(255,255,255,0.68); overflow: hidden; }
    .leftPanel { left: 16px; width: 280px; }
    .rightPanel { right: 16px; width: 320px; }
    .panelHeader { padding: 16px; border-bottom: 1px solid rgba(45,47,51,0.08); background: rgba(255,255,255,0.24); }
    .panelTitle { font-size: 14px; font-weight: 760; letter-spacing: -0.02em; }
    .panelSub { margin-top: 3px; color: var(--muted); font-size: 10.5px; font-weight: 560; letter-spacing: -0.005em; }
    .tabs { display: flex; gap: 6px; margin-top: 12px; }
    .tab { height: 28px; border: 1px solid var(--border); border-radius: 10px; padding: 0 11px; background: rgba(255,255,255,0.28); color: var(--muted); font-size: 11.5px; font-weight: 650; letter-spacing: -0.01em; }
    .tab.active { background: #1c1d21; border-color: rgba(0,0,0,0.24); color: #f3f1ec; }
    .panelScroll { flex: 1; min-height: 0; overflow: auto; padding: 12px; }
    .panelScroll::-webkit-scrollbar { width: 8px; }
    .panelScroll::-webkit-scrollbar-track { background: transparent; }
    .panelScroll::-webkit-scrollbar-thumb { background: rgba(38,40,44,0.18); border-radius: 99px; }
    .printGroup { border: 1px solid var(--border); border-radius: 14px; background: rgba(255,255,255,0.28); overflow: hidden; margin-bottom: 10px; }
    .groupHeader { height: 34px; display: flex; align-items: center; justify-content: space-between; padding: 0 11px; border-bottom: 1px solid rgba(36,38,42,0.1); font-size: 11.5px; font-weight: 710; letter-spacing: -0.01em; }
    .groupHeader span:last-child { color: var(--muted); font-size: 10px; }
    .groupBody { padding: 8px; }
    .partCard, .assetCard { border: 1px solid rgba(36,38,42,0.1); border-radius: 12px; background: rgba(255,255,255,0.32); padding: 9px; margin-bottom: 8px; }
    .partName, .assetName { font-size: 11.5px; font-weight: 620; letter-spacing: -0.01em; }
    .partName b { color: var(--measure); }
    .fileName, .assetId, .emptyLine { margin-top: 5px; color: var(--muted); font-size: 10px; word-break: break-all; }
    .tagRow { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
    .tag { border: 1px solid rgba(36,38,42,0.12); border-radius: 7px; padding: 3px 6px; color: var(--muted); font-size: 9.5px; font-weight: 650; line-height: 1; }
    .tag.active { border-color: rgba(30,31,35,0.2); background: rgba(30,31,35,0.1); color: #303238; }
    .panelFooter { border-top: 1px solid rgba(45,47,51,0.08); padding: 12px; background: rgba(255,255,255,0.24); }
    .twoButtons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .panelButton, .iconButton { border: 1px solid var(--border); border-radius: 11px; background: rgba(255,255,255,0.32); color: #36383d; font-size: 11px; font-weight: 690; min-height: 33px; letter-spacing: -0.01em; }
    .panelButton.primary { background: #1d1e22; border-color: rgba(0,0,0,0.25); color: #f5f3ee; }
    .inspectorHeader { display: flex; align-items: center; justify-content: space-between; }
    .iconButton { width: 31px; height: 31px; font-size: 15px; }
    .settingsScroll { display: flex; flex-direction: column; gap: 12px; }
    .settingsBlock { border: 1px solid var(--border); border-radius: 15px; background: rgba(255,255,255,0.28); padding: 11px; }
    .settingsBlock.stack { display: flex; flex-direction: column; gap: 10px; }
    .settingsTitle { color: #3b3d42; text-transform: none; letter-spacing: -0.015em; font-size: 12px; font-weight: 760; margin-bottom: 10px; }
    .label { display: block; color: var(--muted); font-size: 10.5px; font-weight: 620; margin-bottom: 5px; }
    .label.withTop { margin-top: 10px; }
    select { width: 100%; height: 33px; border: 1px solid var(--border); border-radius: 11px; background: rgba(255,255,255,0.36); color: var(--text); padding: 0 9px; font-size: 11.5px; font-weight: 650; outline: none; }
    .colorRow { display: flex; align-items: center; gap: 9px; }
    .colorRow input { width: 46px; height: 32px; border: 1px solid var(--border); border-radius: 8px; background: transparent; }
    .colorRow span { color: var(--muted); font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .stepperRow, .toggleRow { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .fieldTitle, .toggleRow span { font-size: 11.5px; font-weight: 690; color: var(--text); letter-spacing: -0.01em; }
    .fieldHint { margin-top: 2px; color: var(--muted); font-size: 10px; }
    .stepper { height: 30px; display: grid; grid-template-columns: 28px 44px 28px; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.34); }
    .stepper button { border: 0; background: transparent; color: var(--muted); }
    .stepper button:hover { color: #17181b; background: rgba(255,255,255,0.48); }
    .stepper span { display: grid; place-items: center; border-left: 1px solid var(--border); border-right: 1px solid var(--border); font-size: 12px; }
    .toggle { width: 64px; height: 29px; border: 1px solid var(--border); border-radius: 10px; background: rgba(255,255,255,0.34); color: var(--muted); font-size: 11.5px; font-weight: 690; }
    .toggle.on { background: #1d1e22; border-color: rgba(0,0,0,0.25); color: #f5f3ee; }
    .sizeBox { border: 1px solid var(--border); border-radius: 12px; background: rgba(255,255,255,0.32); padding: 9px; color: var(--muted); font-size: 10.5px; font-weight: 610; }
    .sizeBox b { color: var(--measure); font-weight: 600; }
    .viewport { position: absolute; z-index: 0; inset: 0; min-width: 0; overflow: hidden; background: linear-gradient(140deg, #cbd0d4 0%, #deded9 45%, #c9c5bd 100%); box-shadow: inset 0 90px 160px rgba(255,255,255,0.35), inset 0 -120px 180px rgba(103,98,91,0.18); }
    .viewport::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(90deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 36%, rgba(96,94,90,0.1) 100%); }
    .threeHost { position: absolute; inset: 0; z-index: 1; }
    .threeHost canvas { display: block; width: 100%; height: 100%; }
    .floatingToolbar { position: absolute; z-index: 30; top: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; padding: 6px; border: 1px solid rgba(255,255,255,0.54); border-radius: 16px; background: rgba(239,238,232,0.72); -webkit-backdrop-filter: blur(18px) saturate(125%); backdrop-filter: blur(18px) saturate(125%); box-shadow: 0 18px 45px rgba(75,72,68,0.18), inset 0 1px 0 rgba(255,255,255,0.64); }
    .toolButton { width: 32px; height: 32px; border: 1px solid rgba(36,38,42,0.12); border-radius: 11px; background: rgba(255,255,255,0.3); color: #686c72; display: grid; place-items: center; }
    .toolButton.active { background: #1d1e22; border-color: rgba(0,0,0,0.25); color: #f5f3ee; }
    .miniIcon { width: 16px; height: 16px; }
    .libraryPopup { position: absolute; z-index: 29; top: 72px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; padding: 8px; border: 1px solid rgba(255,255,255,0.54); border-radius: 18px; background: rgba(239,238,232,0.8); -webkit-backdrop-filter: blur(18px) saturate(125%); backdrop-filter: blur(18px) saturate(125%); box-shadow: 0 18px 45px rgba(75,72,68,0.2); }
    .libraryGroup { display: flex; flex-direction: column; gap: 5px; }
    .libraryGroupTitle { color: var(--muted); font-size: 9px; font-weight: 700; line-height: 1; text-transform: uppercase; letter-spacing: 0.08em; padding-left: 3px; }
    .libraryGroupItems { display: flex; gap: 5px; }
    .libraryGroupItems.wallItems { display: grid; grid-template-columns: repeat(3, 76px); }
    .libraryItem { width: 76px; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 1px solid rgba(36,38,42,0.12); border-radius: 12px; background: rgba(255,255,255,0.32); color: #6c7076; font-size: 9px; font-weight: 670; text-align: center; white-space: nowrap; }
    .libraryItem:hover { color: #1d1e22; border-color: rgba(29,30,34,0.24); background: rgba(255,255,255,0.52); }
    .libraryIcon { width: 18px; height: 18px; display: block; background: currentColor; -webkit-mask: var(--icon-url) center / contain no-repeat; mask: var(--icon-url) center / contain no-repeat; }
    .viewportBadge { position: absolute; z-index: 10; right: 352px; top: 18px; border: 1px solid rgba(255,255,255,0.48); border-radius: 12px; background: rgba(239,238,232,0.66); color: #6c7076; font-size: 10.5px; font-weight: 660; padding: 8px 11px; pointer-events: none; backdrop-filter: blur(14px); }
    .mouseHelp { position: absolute; left: 312px; bottom: 18px; max-width: 390px; padding: 9px 11px; border: 1px solid rgba(255,255,255,0.48); border-radius: 14px; background: rgba(239,238,232,0.68); color: #6c7076; font-size: 10.5px; font-weight: 620; pointer-events: none; backdrop-filter: blur(14px); }
    .viewSwitch { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; gap: 4px; padding: 4px; border: 1px solid rgba(255,255,255,0.48); border-radius: 13px; background: rgba(239,238,232,0.7); backdrop-filter: blur(14px); pointer-events: none; }
    .viewSwitch button { height: 26px; padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: var(--muted); font-size: 11px; }
    .viewSwitch button.active { background: rgba(255,255,255,0.44); color: var(--text); }
    @media (max-width: 1020px) {
      .leftPanel { width: 252px; left: 12px; }
      .rightPanel { width: 292px; right: 12px; }
      .viewportBadge { right: 318px; }
      .mouseHelp { left: 282px; max-width: 320px; }
    }
    @media (max-width: 880px) {
      .leftPanel, .rightPanel { left: 12px; right: 12px; width: auto; top: auto; bottom: auto; max-height: calc(50vh - 22px); border-radius: 22px; }
      .leftPanel { top: 12px; }
      .rightPanel { bottom: 12px; }
      .panelHeader { padding: 12px; }
      .panelScroll { padding: 10px; }
      .floatingToolbar { top: calc(50vh - 23px); }
      .libraryPopup { top: calc(50vh + 30px); max-width: calc(100vw - 24px); overflow-x: auto; }
      .viewportBadge, .mouseHelp, .viewSwitch { display: none; }
    }
  `}</style><div className="mainLayout"><LeftPanel activeTab={activeTab} setActiveTab={setActiveTab} printList={printList} onCopy={copyBuildList} onDownload={downloadTxt} /><Viewport config={config} tiles={tiles} setTiles={setTiles} selectedIds={selectedIds} setSelectedIds={setSelectedIds} activeColor={activeColor} showRuler={showRuler} setShowRuler={setShowRuler} showGrid={showGrid} setShowGrid={setShowGrid} /><RightPanel config={config} setConfig={updateConfig} activeColor={activeColor} setActiveColor={setActiveColor} selectionCount={selectedIds.length} onReset={resetConfiguration} onShare={shareBuildList} onExport={downloadTxt} /></div></div>;
}
